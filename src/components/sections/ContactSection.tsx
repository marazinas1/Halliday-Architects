import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { FIRM } from "@/content/firm";
import { supabase } from "@/integrations/supabase/client";
import { container, gap, sectionPadding } from "@/lib/rhythm";

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

const labelClass = "label-uppercase block mb-3";
const inputClass =
  "w-full h-12 rounded-none border-0 border-b border-line bg-transparent px-0 text-[15px] text-ink outline-none transition-colors placeholder:text-stone/50 focus:border-ink focus:ring-0";

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
    if (submitting) return; // guard against double submission
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

    const projectTypeLabel = PROJECT_TYPES.find((t) => t.value === form.projectType)?.label ?? null;
    const timelineLabel = TIMELINES.find((t) => t.value === form.timeline)?.label ?? null;

    // Capture the lead. The database trigger sends the notification email, so
    // nothing here needs to call an edge function.
    try {
      const { error: insertError } = await supabase.from("leads").insert({
        id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        interest,
        project_type: projectTypeLabel,
        timeline: timelineLabel,
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

    setSubmitting(false);
    setSubmitted(true);
  };

  // StageHomy pattern: the form is replaced by an inline confirmation card.
  if (submitted) {
    return (
      <div className="border-y border-line bg-background px-6 py-16 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center bg-sand">
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
    <form onSubmit={handleSubmit} className="space-y-8">
      <input
        type="text"
        name="hl_ref_code"
        id="hl_ref_code"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        tabIndex={-1}
        autoComplete="new-password"
        aria-hidden="true"
        className="pointer-events-none absolute -left-[10000px] h-px w-px opacity-0"
      />

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <label htmlFor="hl-name" className={labelClass}>Name</label>
          <input id="hl-name" type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Your full name" />
        </div>
        <div>
          <label htmlFor="hl-email" className={labelClass}>Email</label>
          <input id="hl-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="your@email.com" />
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <label htmlFor="hl-phone" className={labelClass}>Phone</label>
          <input id="hl-phone" type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })} className={inputClass} placeholder="(555) 000-0000" />
        </div>
        <div>
          <label htmlFor="hl-type" className={labelClass}>Project type</label>
          <select id="hl-type" name="projectType" required value={form.projectType} onChange={(e) => setForm({ ...form, projectType: e.target.value })} className={`${inputClass} cursor-pointer appearance-none`}>
            <option value="">Select a project type</option>
            {PROJECT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="hl-timeline" className={labelClass}>Timeline</label>
        <select id="hl-timeline" name="timeline" value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} className={`${inputClass} cursor-pointer appearance-none`}>
          <option value="">Select a timeline</option>
          {TIMELINES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="hl-message" className={labelClass}>Message</label>
        <textarea id="hl-message" rows={5} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="min-h-[140px] w-full resize-none rounded-none border-0 border-b border-line bg-transparent px-0 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-stone/50 focus:border-ink focus:ring-0" placeholder="Tell us about your project…" />
      </div>

      <Button type="submit" disabled={submitting} className="group h-12 w-full rounded-none bg-ink px-8 text-[11px] font-medium uppercase tracking-[0.16em] text-paper hover:bg-ink/90 sm:w-auto">
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
      </Button>
    </form>
  );
};

const InfoBlock = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="border-t border-line pt-7">
    <p className="label-uppercase mb-3">{label}</p>
    <div className="text-[15px] leading-relaxed text-ink">{children}</div>
  </div>
);

const ContactSection = ({ withHeading = true }: { withHeading?: boolean }) => (
  <section className={`${sectionPadding.base} border-t border-line bg-background`}>
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

      <div className={`grid grid-cols-1 lg:grid-cols-12 ${gap.split}`}>
        <Reveal className="lg:col-span-4">
          <div>
            <p className="label-uppercase mb-4">Studio details</p>
            <h2 className="heading-section mb-5">{FIRM.name}</h2>
            <p className="text-body mb-10 max-w-md">
              The studio is on West Avenue in Ocean City. Every enquiry is read and answered
              personally by one of the principals.
            </p>
            <div className="space-y-7">
              <InfoBlock label="Studio">
                <span className="block">{FIRM.address1}</span>
                <span className="block">{FIRM.address2}</span>
                <span className="mt-1 block text-sm font-normal text-stone">
                  Mail: {FIRM.mailing1}, {FIRM.mailing2}
                </span>
              </InfoBlock>
              <InfoBlock label="Direct">
                <a href={`mailto:${FIRM.email}`} className="hover:opacity-70 transition-opacity">
                  {FIRM.email}
                </a>
                <a href={FIRM.phoneHref} className="mt-1 block hover:opacity-70 transition-opacity">
                  {FIRM.phone}
                </a>
                <span className="mt-1 block text-sm text-stone">Fax {FIRM.fax}</span>
              </InfoBlock>
              <InfoBlock label="Response time">Within one business day</InfoBlock>
            </div>
          </div>
        </Reveal>

        <Reveal className="lg:col-span-8">
          <div className="border-t border-ink pt-7">
            <p className="label-uppercase mb-8">Project enquiry</p>
            <ContactForm />
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

export default ContactSection;
