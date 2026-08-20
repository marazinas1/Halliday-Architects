import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Halliday Architects'

interface InquiryNotificationProps {
  name?: string
  email?: string
  phone?: string
  interest?: string
  projectType?: string
  timeline?: string
  message?: string
  source?: string
  adminUrl?: string
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
    ? `mailto:${email}?subject=${encodeURIComponent(
        `Re: Your inquiry to ${SITE_NAME}`,
      )}`
    : undefined

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{`New inquiry from ${name || 'website visitor'}${interest ? ` — ${interest}` : ''}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={label}>New Website Inquiry</Text>
          <Heading style={h1}>
            {name ? `${name} just reached out` : 'A visitor just reached out'}
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
                  <Link
                    href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                    style={link}
                  >
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
                Reply directly:{' '}
                <Link href={replyTo} style={link}>
                  {email}
                </Link>
              </Text>
            </>
          )}

          <Hr style={hr} />
          <Text style={footer}>
            Sent from {SITE_NAME} — hallidayarchitects.com
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const Row = ({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) => (
  <table style={rowTable}>
    <tbody>
      <tr>
        <td style={rowLabel}>{label}</td>
        <td style={rowValue}>{value}</td>
      </tr>
    </tbody>
  </table>
)

export const template = {
  component: InquiryNotification,
  subject: (data: Record<string, any>) =>
    `New inquiry${data?.name ? ` from ${data.name}` : ''}${
      data?.interest ? ` — ${data.interest}` : ''
    }`,
  to: 'chris@hallidayarchitects.com',
  displayName: 'Inquiry notification',
  previewData: {
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '(555) 123-4567',
    interest: 'New build — In 3–6 months',
    projectType: 'New build',
    timeline: 'In 3–6 months',
    source: 'Halliday Architects — Contact',
    adminUrl: 'https://hallidayarchitects.com/admin/inquiries',
    message: 'I would love to learn more about building a custom home and schedule a consultation next week.',
  },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  margin: 0,
  padding: 0,
}
const container = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '40px 32px',
}
const label = {
  fontSize: '11px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  color: '#6b7280',
  margin: '0 0 12px',
  fontWeight: 500,
}
const h1 = {
  fontFamily: "'Playfair Display', Georgia, serif",
  fontSize: '26px',
  fontWeight: 500,
  color: '#1a1a1a',
  margin: '0 0 8px',
  lineHeight: 1.3,
}
const hr = {
  border: 'none',
  borderTop: '1px solid #e5e7eb',
  margin: '24px 0',
}
const section = { margin: '0' }
const rowTable = { width: '100%', borderCollapse: 'collapse' as const, marginBottom: '10px' }
const rowLabel = {
  width: '110px',
  fontSize: '11px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase' as const,
  color: '#6b7280',
  verticalAlign: 'top' as const,
  paddingTop: '2px',
}
const rowValue = {
  fontSize: '15px',
  color: '#1a1a1a',
  lineHeight: 1.5,
}
const messageLabel = {
  fontSize: '11px',
  letterSpacing: '0.12em',
  textTransform: 'uppercase' as const,
  color: '#6b7280',
  margin: '0 0 8px',
}
const messageBody = {
  fontSize: '15px',
  color: '#1a1a1a',
  lineHeight: 1.6,
  whiteSpace: 'pre-wrap' as const,
  margin: 0,
}
const text = {
  fontSize: '14px',
  color: '#1a1a1a',
  lineHeight: 1.5,
  margin: 0,
}
const link = { color: '#1a1a1a', textDecoration: 'underline' }
const footer = {
  fontSize: '12px',
  color: '#9ca3af',
  margin: 0,
  textAlign: 'center' as const,
}