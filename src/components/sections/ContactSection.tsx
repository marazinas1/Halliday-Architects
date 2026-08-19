import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, CheckCircle, Clock, Loader2, Mail, Phone } from "lucide-react";
import Reveal from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { container, sectionPadding } from "@/lib/rhythm";

/** Project types offered by the practice. */
const PROJECT_TYPES = [
  { value: "new_build", label: "New build" },
  { value: "renovation", label: "Renovation" },
  { value: "addition", label: "Addition" },
  { value: "interior", label: "Interior" },
  { value: "other", label: "Something else" },
];

const TIMELINES = [
  { value: "asap", label: "As soon as possible" },
  { value: "3_6_months", label: "In 3–6 months" },
  { value: "6_12_months", label: "In 6–12 months" },
  { value: "exploring", label: "Still exploring" },
];

const fieldStyle = { borderRadius: "4px", border: "1px solid #E0E0E0" } as const;
const labelClass = "block text-xs font-medium uppercase mb-2 tracking-[0.1em] text-stone";
const inputClass =
  "w-full h-12 px-4 bg-paper text-sm text-ink placeholder:text-stone/50 focus:border-ink focus:outline-none transition-colors";

const formatPhone = (raw: string) => {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

export const ContactForm = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    projectType: "",
    timeline: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hp, setHp] = useState("");

  const interest = (() => {
    const type = PROJECT_TYPES.find((t) => t.value === form.projectType)?.label ?? "Project Inquiry";
    const when = TIMELINES.find((t) => t.value === form.timeline)?.label;
    return when ? `${type} — ${when}` : type;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.phone.replace(/\D/g, "").length !== 10) {
      toast.error("Please enter a valid US phone number — (555) 000-0000");
      return;
    }
    // Honeypot tripped — fail safe: pretend success, skip the insert.
    if (hp) {
      setSubmitted(true);
      return;
    }
    setSubmitting(true);
    const id = crypto.randomUUID();

    // 1. Capture the lead. Only a failure here is a real failure for the user.
    try {
      const { error: insertError } = await supabase.from("leads").insert({
        id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        interest,
        message: form.message || null,
        source: "Halliday Architects — Contact",
        user_agent: navigator.userAgent,
      });
      if (insertError) throw insertError;
    } catch (err) {
      console.error("Lead insert failed", err);
      toast.error("Something went wrong. Please call 609.957.6789 or email chris@hallidayarchitects.com.");
      setSubmitting(false);
      return;
    }

    // 2. Notification email is best-effort — never surfaced to the user.
    try {
      const { error } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "inquiry-notification",
          idempotencyKey: `contact-${id}`,
          templateData: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            interest,
            message: form.message,
            source: "Halliday Architects — Contact",
          },
        },
      });
      if (error) console.error("Inquiry notification email failed (lead was saved)", error);
    } catch (err) {
      console.error("Inquiry notification email failed (lead was saved)", err);
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  // StageHomy pattern: the form is replaced by an inline confirmation card.
  if (submitted) {
    return (
      <div className="p-12 text-center bg-paper border border-line" style={{ borderRadius: "4px" }}>
        <div
          className="w-16 h-16 flex items-center justify-center mx-auto mb-6 bg-sand"
          style={{ borderRadius: "4px" }}
        >
          <CheckCircle className="w-8 h-8 text-ink" />
        </div>
        <h3 className="heading-card mb-4">Thank you</h3>
        <p className="text-body max-w-md mx-auto">
          Your message has reached the studio. One of the principals will be in touch shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input
        type="text"
        name="hl_ref_code"
        id="hl_ref_code"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        tabIndex={-1}
        autoComplete="new-password"
        aria-hidden="true"
        style={{ position: "absolute", left: "-10000px", width: 1, height: 1, opacity: 0 }}
      />

      <div className="grid md:grid-cols-3 gap-5">
        <div>
          <label htmlFor="hl-name" className={labelClass}>Name</label>
          <input id="hl-name" type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} style={fieldStyle} placeholder="Your full name" />
        </div>
        <div>
          <label htmlFor="hl-email" className={labelClass}>Email</label>
          <input id="hl-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} style={fieldStyle} placeholder="your@email.com" />
        </div>
        <div>
          <label htmlFor="hl-phone" className={labelClass}>Phone</label>
          <input id="hl-phone" type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })} className={inputClass} style={fieldStyle} placeholder="(555) 000-0000" />
        </div>
      </div>

      <div>
        <label htmlFor="hl-type" className={labelClass}>Project type</label>
        <select id="hl-type" name="projectType" required value={form.projectType} onChange={(e) => setForm({ ...form, projectType: e.target.value })} className={`${inputClass} appearance-none cursor-pointer`} style={fieldStyle}>
          <option value="">Select a project type</option>
          {PROJECT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="hl-timeline" className={labelClass}>Timeline</label>
        <select id="hl-timeline" name="timeline" value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} className={`${inputClass} appearance-none cursor-pointer`} style={fieldStyle}>
          <option value="">Select a timeline</option>
          {TIMELINES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="hl-message" className={labelClass}>Message</label>
        <textarea id="hl-message" rows={5} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full px-4 py-3 min-h-[120px] bg-paper text-sm text-ink placeholder:text-stone/50 focus:border-ink focus:outline-none resize-none transition-colors" style={fieldStyle} placeholder="Tell us about your project…" />
      </div>

      <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto group disabled:opacity-60 disabled:cursor-not-allowed">
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            Send message
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>
    </form>
  );
};

const InfoRow = ({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Mail;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center gap-4">
    <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 bg-sand" style={{ borderRadius: "4px" }}>
      <Icon className="w-5 h-5 text-ink" />
    </div>
    <div className="text-left">
      <p className="text-xs uppercase font-medium mb-1 tracking-[0.15em] text-stone">{label}</p>
      <div className="text-sm md:text-base font-medium text-ink">{children}</div>
    </div>
  </div>
);

const ContactSection = ({ withHeading = true }: { withHeading?: boolean }) => (
  <section className={`${sectionPadding.base} section-sand`}>
    <div className={container.wide}>
      {withHeading && (
        <Reveal>
          <div className="text-center mb-16">
            <p className="label-uppercase mb-4">Get In Touch</p>
            <h2 className="heading-section text-ink mb-6">Contact</h2>
            <div className="divider mx-auto mb-6" />
            <p className="text-body max-w-2xl mx-auto">
              Tell us about your project and one of our partners will be in touch shortly.
            </p>
          </div>
        </Reveal>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        <Reveal>
          <div>
            <h3 className="heading-section mb-4">Halliday Architects</h3>
            <p className="text-body mb-8 max-w-md">
              728 West Avenue, Suite A, Ocean City, NJ 08226.
            </p>
            <div className="space-y-6 md:space-y-8">
              <InfoRow icon={Mail} label="Email">
                <a href="mailto:chris@hallidayarchitects.com" className="hover:opacity-70 transition-opacity">
                  chris@hallidayarchitects.com
                </a>
              </InfoRow>
              <InfoRow icon={Phone} label="Phone">
                <a href="tel:6099576789" className="hover:opacity-70 transition-opacity">609.957.6789</a>
              </InfoRow>
              <InfoRow icon={Clock} label="Response time">
                Within one business day
              </InfoRow>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <ContactForm />
        </Reveal>
      </div>
    </div>
  </section>
);

export default ContactSection;
