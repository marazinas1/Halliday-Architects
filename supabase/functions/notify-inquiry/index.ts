import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { sendLovableEmail } from 'npm:@lovable.dev/email-js'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { z } from 'npm:zod@3.23.8'
import { template as inquiryTemplate } from '../_shared/transactional-email-templates/inquiry-notification.tsx'

// Fired by the `leads_notify_on_insert` database trigger. Never called from the
// browser: it only accepts a lead id and re-reads the row with the service role.
const SITE_NAME = 'Halliday Architects'
// TODO(launch): notify.hallidayarchitects.com must be verified before mail delivers.
const SENDER_DOMAIN = 'notify.hallidayarchitects.com'
const DEFAULT_RECIPIENT = 'chris@hallidayarchitects.com'
const ADMIN_URL = 'https://hallidayarchitects.com/admin/inquiries'

const BodySchema = z.object({ leadId: z.string().uuid() })

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

// Constant-time string comparison: never short-circuits on the first mismatch
// and walks the longer of the two so timing does not leak the secret's length.
const timingSafeEqual = (a: string, b: string) => {
  const length = Math.max(a.length, b.length)
  let diff = a.length ^ b.length
  for (let i = 0; i < length; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0)
  }
  return diff === 0
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  // This function runs with JWT verification off (the database trigger calls it
  // over net.http_post), so a shared secret is the only credential.
  const expectedSecret = Deno.env.get('NOTIFY_INQUIRY_SECRET')
  if (!expectedSecret) {
    console.error('NOTIFY_INQUIRY_SECRET is not set — refusing to send')
    return json({ error: 'Server configuration error' }, 500)
  }

  const providedSecret = req.headers.get('x-notify-secret')
  if (
    typeof providedSecret !== 'string' ||
    providedSecret.length === 0 ||
    !timingSafeEqual(providedSecret, expectedSecret)
  ) {
    return json({ error: 'Unauthorized' }, 401)
  }

  const parsed = BodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return json({ error: 'leadId (uuid) is required' }, 400)
  const { leadId } = parsed.data

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  )

  const { data: lead, error: leadError } = await admin
    .from('leads')
    .select('id, name, email, phone, interest, project_type, timeline, message, source, notified_at')
    .eq('id', leadId)
    .maybeSingle()

  if (leadError || !lead) return json({ error: 'Lead not found' }, 404)
  // Idempotent: a retried dispatch must not send twice.
  if (lead.notified_at) return json({ success: true, skipped: 'already_notified' })

  const recordFailure = async (reason: string) => {
    await admin
      .from('leads')
      .update({ notify_error: reason.slice(0, 500), notified_at: null })
      .eq('id', leadId)
  }

  const apiKey = Deno.env.get('LOVABLE_API_KEY')
  if (!apiKey) {
    await recordFailure('Server configuration error: LOVABLE_API_KEY is not set')
    return json({ error: 'Server configuration error' }, 500)
  }

  // Recipients are client-configurable (both principals, comma separated).
  const { data: settings } = await admin
    .from('site_settings')
    .select('inquiry_notify_emails')
    .maybeSingle()

  const recipients = (settings?.inquiry_notify_emails ?? '')
    .split(',')
    .map((value: string) => value.trim())
    .filter((value: string) => value.length > 3 && value.includes('@'))

  const to = recipients.length > 0 ? recipients : [DEFAULT_RECIPIENT]

  const templateData = {
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    interest: lead.interest,
    projectType: lead.project_type,
    timeline: lead.timeline,
    message: lead.message,
    source: lead.source,
    adminUrl: ADMIN_URL,
  }

  const element = React.createElement(inquiryTemplate.component, templateData)
  const html = await renderAsync(element)
  const text = await renderAsync(element, { plainText: true })
  const subject =
    typeof inquiryTemplate.subject === 'function'
      ? inquiryTemplate.subject(templateData)
      : inquiryTemplate.subject

  const failures: string[] = []
  for (const recipient of to) {
    try {
      await sendLovableEmail(
        {
          to: recipient,
          from: `${SITE_NAME} <noreply@${SENDER_DOMAIN}>`,
          sender_domain: SENDER_DOMAIN,
          subject,
          html,
          text,
          purpose: 'transactional',
          label: 'inquiry-notification',
          idempotency_key: `inquiry-${leadId}-${recipient}`,
          message_id: crypto.randomUUID(),
        },
        { apiKey, sendUrl: Deno.env.get('LOVABLE_SEND_URL') },
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('Inquiry notification failed', { leadId, recipient, message })
      failures.push(`${recipient}: ${message}`)
    }
  }

  if (failures.length === to.length) {
    await recordFailure(failures.join(' | '))
    return json({ error: 'Failed to send notification' }, 502)
  }

  await admin
    .from('leads')
    .update({
      notified_at: new Date().toISOString(),
      notify_error: failures.length > 0 ? `Partial failure — ${failures.join(' | ')}` : null,
    })
    .eq('id', leadId)

  return json({ success: true, recipients: to.length, failures: failures.length })
})