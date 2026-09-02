import * as React from 'npm:react@18.3.1'
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
} from 'npm:@react-email/components@0.0.22'

const SITE_NAME = 'Halliday Architects'

const ROLE_LABELS: Record<string, string> = {
  developer: 'Developer',
  owner: 'Owner',
  editor: 'Editor',
}

export interface AdminInviteProps {
  /** Role the account holds in the admin panel. */
  role?: string | null
  /** One-time link that lets the recipient set their password. */
  actionLink?: string | null
}

/**
 * Sent when an admin account that was never activated is (re-)invited.
 * The action link is a Supabase recovery link landing on /admin/set-password.
 */
const AdminInvite = ({ role, actionLink }: AdminInviteProps) => {
  const roleLabel = role ? ROLE_LABELS[role] ?? role : null

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{`Your invitation to the ${SITE_NAME} admin panel`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={label}>Admin invitation</Text>
          <Heading style={h1}>You have been invited</Heading>
          <Hr style={hr} />

          <Section>
            <Text style={paragraph}>
              An administrator invited you to the {SITE_NAME} admin panel
              {roleLabel ? ` as ${roleLabel}` : ''}. Use the button below to set your
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
  )
}

export const template = {
  component: AdminInvite,
  subject: `You have been invited to the ${SITE_NAME} admin`,
  displayName: 'Admin invitation',
  previewData: {
    role: 'editor',
    actionLink: 'https://hallidayarchitects.com/admin/set-password?token=example',
  },
}

const main: React.CSSProperties = {
  backgroundColor: '#ffffff',
  fontFamily: 'Helvetica, Arial, sans-serif',
  color: '#141414',
}

const container: React.CSSProperties = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '40px 28px',
}

const label: React.CSSProperties = {
  fontSize: '11px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: '#616161',
  margin: '0 0 12px',
}

const h1: React.CSSProperties = {
  fontSize: '26px',
  lineHeight: '1.25',
  fontWeight: 800,
  color: '#141414',
  margin: '0 0 8px',
}

const hr: React.CSSProperties = { borderColor: '#E5E5E5', margin: '24px 0' }

const paragraph: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '1.7',
  color: '#595959',
  margin: '0 0 24px',
}

const button: React.CSSProperties = {
  backgroundColor: '#141414',
  color: '#ffffff',
  fontSize: '12px',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block',
}

const smallMuted: React.CSSProperties = {
  fontSize: '12px',
  lineHeight: '1.6',
  color: '#616161',
  margin: '24px 0 0',
  wordBreak: 'break-all',
}

const link: React.CSSProperties = { color: '#141414' }

const footer: React.CSSProperties = {
  fontSize: '12px',
  lineHeight: '1.6',
  color: '#616161',
  margin: '0',
}
