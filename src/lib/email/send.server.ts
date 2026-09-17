// Server-only transactional email delivery.
// Delivery problems must never fail the caller — callers get `sent: false`
// and keep whatever manual-handover payload they already built.
import * as React from "react";
import { render } from "@react-email/render";
import { sendLovableEmail } from "@lovable.dev/email-js";
import { adminInviteTemplate, inquiryNotificationTemplate } from "./templates";
import type { AdminInviteProps, InquiryNotificationProps } from "./templates";

const SITE_NAME = "Halliday Architects";
// TODO(launch): notify.hallidayarchitects.com must be verified before mail delivers.
const SENDER_DOMAIN = "notify.hallidayarchitects.com";

async function deliver(options: {
  to: string;
  subject: string;
  html: string;
  text: string;
  label: string;
  idempotencyKey: string;
}): Promise<boolean> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return false;
  try {
    await sendLovableEmail(
      {
        to: options.to,
        from: `${SITE_NAME} <noreply@${SENDER_DOMAIN}>`,
        sender_domain: SENDER_DOMAIN,
        subject: options.subject,
        html: options.html,
        text: options.text,
        purpose: "transactional",
        label: options.label,
        idempotency_key: options.idempotencyKey,
        message_id: crypto.randomUUID(),
      },
      { apiKey, sendUrl: process.env["LOVABLE_SEND_URL"] },
    );
    return true;
  } catch (error) {
    console.error(
      `${options.label} send failed:`,
      error instanceof Error ? error.message : error,
    );
    return false;
  }
}

export async function sendAdminInviteEmail(
  email: string,
  props: AdminInviteProps & { userId: string },
): Promise<boolean> {
  const element = React.createElement(adminInviteTemplate.component, props);
  return deliver({
    to: email,
    subject: adminInviteTemplate.subject,
    html: await render(element),
    text: await render(element, { plainText: true }),
    label: "admin-invite",
    idempotencyKey: `admin-invite-${props.userId}-${Date.now()}`,
  });
}

export async function sendInquiryNotificationEmail(
  recipient: string,
  leadId: string,
  data: InquiryNotificationProps,
): Promise<void> {
  const element = React.createElement(inquiryNotificationTemplate.component, data);
  await deliver({
    to: recipient,
    subject: inquiryNotificationTemplate.subject(data),
    html: await render(element),
    text: await render(element, { plainText: true }),
    label: "inquiry-notification",
    idempotencyKey: `inquiry-${leadId}-${recipient}`,
  });
}
