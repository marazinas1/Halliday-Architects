import { useState } from "react";
import { toast } from "sonner";
import Reveal from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { container, sectionPadding } from "@/lib/rhythm";

const formatPhone = (raw: string) => {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

export const ContactForm = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [hp, setHp] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.phone.replace(/\D/g, "").length !== 10) {
      toast.error("Please enter a valid US phone number — (555) 000-0000");
      return;
    }
    // Honeypot tripped — fail safe: pretend success, skip the insert.
    if (hp) {
      toast.success("Thank you — we'll be in touch shortly to schedule your consultation.");
      setForm({ name: "", email: "", phone: "", message: "" });
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
        interest: "Project Inquiry",
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
            interest: "Project Inquiry",
            message: form.message,
            source: "Halliday Architects — Contact",
          },
        },
      });
      if (error) console.error("Inquiry notification email failed (lead was saved)", error);
    } catch (err) {
      console.error("Inquiry notification email failed (lead was saved)", err);
    }

    toast.success("Thank you — we'll be in touch shortly to schedule your consultation.");
    setForm({ name: "", email: "", phone: "", message: "" });
    setSubmitting(false);
  };

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

      <div>
        <label htmlFor="hl-name" className="text-xs font-sans font-medium uppercase tracking-widest text-stone mb-2 block">Name</label>
        <input id="hl-name" type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-elegant" placeholder="Your full name" />
      </div>
      <div>
        <label htmlFor="hl-email" className="text-xs font-sans font-medium uppercase tracking-widest text-stone mb-2 block">Email</label>
        <input id="hl-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-elegant" placeholder="your@email.com" />
      </div>
      <div>
        <label htmlFor="hl-phone" className="text-xs font-sans font-medium uppercase tracking-widest text-stone mb-2 block">Phone Number</label>
        <input id="hl-phone" type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })} className="input-elegant" placeholder="(555) 000-0000" />
      </div>
      <div>
        <label htmlFor="hl-message" className="text-xs font-sans font-medium uppercase tracking-widest text-stone mb-2 block">Message</label>
        <textarea id="hl-message" rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input-elegant resize-none" placeholder="Tell us about your project…" />
      </div>
      <button type="submit" disabled={submitting} className="btn-primary w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed">
        {submitting ? "Sending…" : "Send message"}
      </button>
    </form>
  );
};

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 max-w-6xl mx-auto">
        <Reveal>
          <div>
            <h3 className="heading-card text-ink mb-6">Halliday Architects</h3>
            <div className="divider mb-8" />
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-sans font-medium uppercase tracking-widest text-stone mb-2">Address</h4>
                <p className="text-body">728 West Avenue, Suite A<br />Ocean City, NJ 08226</p>
              </div>
              <div>
                <h4 className="text-xs font-sans font-medium uppercase tracking-widest text-stone mb-2">Phone</h4>
                <a href="tel:6099576789" className="text-body hover:text-ink transition-colors">609.957.6789</a>
              </div>
              <div>
                <h4 className="text-xs font-sans font-medium uppercase tracking-widest text-stone mb-2">Email</h4>
                <a href="mailto:chris@hallidayarchitects.com" className="text-body hover:text-ink transition-colors">
                  chris@hallidayarchitects.com
                </a>
              </div>
            </div>

          </div>
        </Reveal>

        <Reveal>
          <div className="card-elegant p-8 md:p-10">
            <ContactForm />
          </div>
        </Reveal>
      </div>
    </div>
  </section>
);

export default ContactSection;
