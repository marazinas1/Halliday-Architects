// Branded transactional email templates.
// Ported from supabase/functions/_shared/transactional-email-templates —
// rendered server-side with @react-email/render.
import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

const SITE_NAME = "Halliday Architects";

const ROLE_LABELS: Record<string, string> = {
  developer: "Developer",
  owner: "Owner",
  editor: "Editor",
};

export interface AdminInviteProps {
  /** Role the account holds in the admin panel. */
  role?: string | null;
  /** One-time link that lets the recipient set their password. */
  actionLink?: string | null;
}

/**
 * Sent when an admin account that was never activated is (re-)invited.
 * The action link is a recovery link landing on /admin/set-password.
 */
const AdminInvite = ({ role, actionLink }: AdminInviteProps) => {
  const roleLabel = role ? (ROLE_LABELS[role] ?? role) : null;

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{`Your invitation to the ${SITE_NAME} admin panel`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={labelStyle}>Admin invitation</Text>
          <Heading style={h1}>You have been invited</Heading>
          <Hr style={hr} />

          <Section>
            <Text style={paragraph}>
              An administrator invited you to the {SITE_NAME} admin panel
              {roleLabel ? ` as ${roleLabel}` : ""}. Use the button below to set your
              password and finish activating your account.
            </Text>

            {actionLink && (
              <>
                <Button href={actionLink} style={button}>
                  Set your password
                </Button>
                <Text style={smallMuted}>
                  If the button does not work, copy and paste this link into your browser:
                  <br />
                  <Link href={actionLink} style={link}>
                    {actionLink}
                  </Link>
                </Text>
              </>
            )}
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            This link can only be used once and expires after a short time. If you were not
            expecting this invitation, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export const adminInviteTemplate = {
  component: AdminInvite,
  subject: `You have been invited to the ${SITE_NAME} admin`,
};

export interface InquiryNotificationProps {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  interest?: string | null;
  projectType?: string | null;
  timeline?: string | null;
  message?: string | null;
  source?: string | null;
  adminUrl?: string | null;
}

const InquiryNotification = ({
  name,
  email,
  phone,
  interest,
  projectType,
  timeline,
  message,
  source,
  adminUrl,
}: InquiryNotificationProps) => {
  const replyTo = email
    ? `mailto:${email}?subject=${encodeURIComponent(`Re: Your inquiry to ${SITE_NAME}`)}`
    : undefined;

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>
        {`New inquiry from ${name || "website visitor"}${interest ? ` — ${interest}` : ""}`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={labelStyle}>New Website Inquiry</Text>
          <Heading style={h1Serif}>
            {name ? `${name} just reached out` : "A visitor just reached out"}
          </Heading>
          <Hr style={hr} />

          <Section style={section}>
            {name && <Row label="Name" value={name} />}
            {email && (
              <Row
                label="Email"
                value={
                  <Link href={`mailto:${email}`} style={link}>
                    {email}
                  </Link>
                }
              />
            )}
            {phone && (
              <Row
                label="Phone"
                value={
                  <Link href={`tel:${phone.replace(/[^0-9+]/g, "")}`} style={link}>
                    {phone}
                  </Link>
                }
              />
            )}
            {projectType && <Row label="Project type" value={projectType} />}
            {timeline && <Row label="Timeline" value={timeline} />}
            {!projectType && interest && <Row label="Interest" value={interest} />}
            {source && <Row label="Source" value={source} />}
          </Section>

          {message && (
            <>
              <Hr style={hr} />
              <Text style={messageLabel}>Message</Text>
              <Text style={messageBody}>{message}</Text>
            </>
          )}

          {adminUrl && (
            <>
              <Hr style={hr} />
              <Text style={text}>
                <Link href={adminUrl} style={link}>
                  Open this enquiry in the admin panel
                </Link>
              </Text>
            </>
          )}

          {replyTo && (
            <>
              <Hr style={hr} />
              <Text style={text}>
                Reply directly:{" "}
                <Link href={replyTo} style={link}>
                  {email}
                </Link>
              </Text>
            </>
          )}

          <Hr style={hr} />
          <Text style={footerCenter}>Sent from {SITE_NAME} — hallidayarchitects.com</Text>
        </Container>
      </Body>
    </Html>
  );
};

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <table style={rowTable}>
    <tbody>
      <tr>
        <td style={rowLabel}>{label}</td>
        <td style={rowValue}>{value}</td>
      </tr>
    </tbody>
  </table>
);

export const inquiryNotificationTemplate = {
  component: InquiryNotification,
  subject: (data: InquiryNotificationProps) =>
    `New inquiry${data?.name ? ` from ${data.name}` : ""}${
      data?.interest ? ` — ${data.interest}` : ""
    }`,
};

const main: React.CSSProperties = {
  backgroundColor: "#ffffff",
  fontFamily: "Helvetica, Arial, sans-serif",
  color: "#141414",
};

const container: React.CSSProperties = {
  maxWidth: "560px",
  margin: "0 auto",
  padding: "40px 28px",
};

const labelStyle: React.CSSProperties = {
  fontSize: "11px",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "#616161",
  margin: "0 0 12px",
};

const h1: React.CSSProperties = {
  fontSize: "26px",
  lineHeight: "1.25",
  fontWeight: 800,
  color: "#141414",
  margin: "0 0 8px",
};

const h1Serif: React.CSSProperties = {
  fontFamily: "Georgia, serif",
  fontSize: "26px",
  fontWeight: 500,
  color: "#1a1a1a",
  margin: "0 0 8px",
  lineHeight: 1.3,
};

const hr: React.CSSProperties = { borderColor: "#E5E5E5", margin: "24px 0" };

const section: React.CSSProperties = { margin: "0" };

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.7",
  color: "#595959",
  margin: "0 0 24px",
};

const button: React.CSSProperties = {
  backgroundColor: "#141414",
  color: "#ffffff",
  fontSize: "12px",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  padding: "14px 28px",
  textDecoration: "none",
  display: "inline-block",
};

const smallMuted: React.CSSProperties = {
  fontSize: "12px",
  lineHeight: "1.6",
  color: "#616161",
  margin: "24px 0 0",
  wordBreak: "break-all",
};

const link: React.CSSProperties = { color: "#141414" };

const footer: React.CSSProperties = {
  fontSize: "12px",
  lineHeight: "1.6",
  color: "#616161",
  margin: "0",
};

const footerCenter: React.CSSProperties = {
  fontSize: "12px",
  color: "#9ca3af",
  margin: 0,
  textAlign: "center" as const,
};

const rowTable: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse" as const,
  marginBottom: "10px",
};

const rowLabel: React.CSSProperties = {
  width: "110px",
  fontSize: "11px",
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  color: "#6b7280",
  verticalAlign: "top" as const,
  paddingTop: "2px",
};

const rowValue: React.CSSProperties = {
  fontSize: "15px",
  color: "#1a1a1a",
  lineHeight: 1.5,
};

const messageLabel: React.CSSProperties = {
  fontSize: "11px",
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  color: "#6b7280",
  margin: "0 0 8px",
};

const messageBody: React.CSSProperties = {
  fontSize: "15px",
  color: "#1a1a1a",
  lineHeight: 1.6,
  whiteSpace: "pre-wrap" as const,
  margin: 0,
};

const text: React.CSSProperties = {
  fontSize: "14px",
  color: "#1a1a1a",
  lineHeight: 1.5,
  margin: 0,
};
