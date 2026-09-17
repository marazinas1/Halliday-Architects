// Inquiry notification endpoint — ported from the notify-inquiry edge
// function. Fired by the `leads_notify_on_insert` database trigger, never
// from the browser: it only accepts a lead id and re-reads the row with the
// service role. The shared secret stays in the database; verification goes
// through the `verify_notify_secret` security-definer function so the value
// never leaves the database.
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const DEFAULT_RECIPIENT = "chris@hallidayarchitects.com";
const ADMIN_URL = "https://hallidayarchitects.com/admin/inquiries";

const BodySchema = z.object({ leadId: z.string().uuid() });

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const Route = createFileRoute("/api/public/notify-inquiry")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const providedSecret = request.headers.get("x-notify-secret");
        if (!providedSecret) return json({ error: "Unauthorized" }, 401);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Constant-time comparison happens inside the database function; the
        // secret itself is never read into this process.
        const { data: secretOk, error: secretError } = await supabaseAdmin.rpc(
          "verify_notify_secret",
          { _provided: providedSecret },
        );
        if (secretError) {
          console.error("verify_notify_secret failed:", secretError.message);
          return json({ error: "Server configuration error" }, 500);
        }
        if (!secretOk) return json({ error: "Unauthorized" }, 401);

        const parsed = BodySchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return json({ error: "leadId (uuid) is required" }, 400);
        const { leadId } = parsed.data;

        const { data: lead, error: leadError } = await supabaseAdmin
          .from("leads")
          .select(
            "id, name, email, phone, interest, project_type, timeline, message, source, notified_at",
          )
          .eq("id", leadId)
          .maybeSingle();

        if (leadError || !lead) return json({ error: "Lead not found" }, 404);
        // Idempotent: a retried dispatch must not send twice.
        if (lead.notified_at) return json({ success: true, skipped: "already_notified" });

        const recordFailure = async (reason: string) => {
          await supabaseAdmin
            .from("leads")
            .update({ notify_error: reason.slice(0, 500), notified_at: null })
            .eq("id", leadId);
        };

        if (!process.env["LOVABLE_API_KEY"]) {
          await recordFailure("Server configuration error: LOVABLE_API_KEY is not set");
          return json({ error: "Server configuration error" }, 500);
        }

        // Recipients are client-configurable (both principals, comma separated).
        const { data: settings } = await supabaseAdmin
          .from("site_settings")
          .select("inquiry_notify_emails")
          .maybeSingle();

        const recipients = (settings?.inquiry_notify_emails ?? "")
          .split(",")
          .map((value: string) => value.trim())
          .filter((value: string) => value.length > 3 && value.includes("@"));

        const to = recipients.length > 0 ? recipients : [DEFAULT_RECIPIENT];

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
        };

        const { sendInquiryNotificationEmail } = await import("@/lib/email/send.server");

        const failures: string[] = [];
        for (const recipient of to) {
          try {
            await sendInquiryNotificationEmail(recipient, leadId, templateData);
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error("Inquiry notification failed", { leadId, recipient, message });
            failures.push(`${recipient}: ${message}`);
          }
        }

        if (failures.length === to.length) {
          await recordFailure(failures.join(" | "));
          return json({ error: "Failed to send notification" }, 502);
        }

        await supabaseAdmin
          .from("leads")
          .update({
            notified_at: new Date().toISOString(),
            notify_error: failures.length > 0 ? `Partial failure — ${failures.join(" | ")}` : null,
          })
          .eq("id", leadId);

        return json({ success: true, recipients: to.length, failures: failures.length });
      },
    },
  },
});
