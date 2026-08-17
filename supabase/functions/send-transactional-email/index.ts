import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { sendLovableEmail } from 'npm:@lovable.dev/email-js'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { TEMPLATES } from '../_shared/transactional-email-templates/registry.ts'

// Simple direct-send inquiry notification (no queue, no suppression, no unsubscribe).
const SITE_NAME = 'Halliday Architects'
// SENDER_DOMAIN must be the verified sender subdomain for this project.
// TODO: update at go-live once the Halliday Architects email domain is verified.
const SENDER_DOMAIN = 'notify.hallidayarchitects.com'
const FROM_DOMAIN = SENDER_DOMAIN

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const apiKey = Deno.env.get('LOVABLE_API_KEY')
  if (!apiKey) {
    console.error('Missing LOVABLE_API_KEY')
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let templateName: string
  let recipientEmail: string | undefined
  let idempotencyKey: string
  let templateData: Record<string, unknown> = {}
  const messageId = crypto.randomUUID()

  try {
    const body = await req.json()
    templateName = body.templateName || body.template_name
    recipientEmail = body.recipientEmail || body.recipient_email
    idempotencyKey = body.idempotencyKey || body.idempotency_key || messageId
    if (body.templateData && typeof body.templateData === 'object') {
      templateData = body.templateData
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (!templateName) {
    return new Response(JSON.stringify({ error: 'templateName is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const template = TEMPLATES[templateName]
  if (!template) {
    return new Response(
      JSON.stringify({
        error: `Template '${templateName}' not found. Available: ${Object.keys(TEMPLATES).join(', ')}`,
      }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  const effectiveRecipient = template.to || recipientEmail
  if (!effectiveRecipient) {
    return new Response(
      JSON.stringify({ error: 'recipientEmail is required (unless the template defines a fixed recipient)' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  const html = await renderAsync(React.createElement(template.component, templateData))
  const text = await renderAsync(React.createElement(template.component, templateData), {
    plainText: true,
  })
  const subject =
    typeof template.subject === 'function' ? template.subject(templateData) : template.subject

  try {
    await sendLovableEmail(
      {
        to: effectiveRecipient,
        from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
        sender_domain: SENDER_DOMAIN,
        subject,
        html,
        text,
        purpose: 'transactional',
        label: templateName,
        idempotency_key: idempotencyKey,
        message_id: messageId,
      },
      { apiKey, sendUrl: Deno.env.get('LOVABLE_SEND_URL') },
    )
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('Email send failed', { templateName, error: errorMsg })
    return new Response(JSON.stringify({ error: 'Failed to send email' }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
