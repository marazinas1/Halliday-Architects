import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import AdminProtected from "@/components/admin/AdminProtected";
import PageImageSlot from "@/components/admin/PageImageSlot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { usePageContent } from "@/hooks/usePageContent";
import { useSavePageText } from "@/hooks/admin/usePageContentAdmin";
import { useResolvedPageImages } from "@/hooks/useResolvedPageImages";

const FALLBACK_HEADING = "Contact";
const FALLBACK_INTRO =
  "Tell us about your site and what you have in mind. Every enquiry is read and answered personally by one of the principals.";

function ContactBody() {
  const { image, copy, isLoading } = usePageContent();
  const { resolve } = useResolvedPageImages();
  const saveText = useSavePageText();
  const { toast } = useToast();
  const [values, setValues] = useState({ heading: "", intro: "" });

  const heading = copy("contact", "heading", "");
  const intro = copy("contact", "intro", "");
  useEffect(() => {
    setValues({ heading, intro });
  }, [heading, intro]);

  const save = async () => {
    try {
      await saveText.mutateAsync({ page: "contact", values });
      toast({ title: "Saved", description: "Contact page wording updated." });
    } catch (err) {
      toast({ variant: "destructive", title: "Could not save", description: (err as Error).message });
    }
  };

  const hero = resolve("contact", "hero");

  return (
    <div className="max-w-3xl">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl text-ink">Contact</h1>
          <p className="text-sm text-stone">
            The wording above the enquiry form and the photograph beneath it. Enquiries themselves
            arrive in the inbox.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/contact" target="_blank" rel="noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            View page
          </Link>
        </Button>
      </div>

      <section className="mb-8 rounded border border-line bg-card p-5">
        <p className="mb-4 text-sm font-medium text-ink">Wording</p>

        <Label htmlFor="heading" className="text-sm font-medium text-ink">
          Page heading
        </Label>
        <Input
          id="heading"
          className="mt-2"
          value={values.heading}
          disabled={isLoading}
          placeholder={FALLBACK_HEADING}
          onChange={(e) => setValues((v) => ({ ...v, heading: e.target.value }))}
        />

        <Label htmlFor="intro" className="mt-5 block text-sm font-medium text-ink">
          Introduction
        </Label>
        <Textarea
          id="intro"
          rows={3}
          className="mt-2"
          value={values.intro}
          disabled={isLoading}
          placeholder={FALLBACK_INTRO}
          onChange={(e) => setValues((v) => ({ ...v, intro: e.target.value }))}
        />

        <div className="mt-5 flex items-center gap-3">
          <Button onClick={save} disabled={saveText.isPending}>
            Save wording
          </Button>
          <span className="text-xs text-stone">Empty fields keep the wording shown in grey.</span>
        </div>
      </section>

      <section>
        <p className="mb-1 text-sm font-medium text-ink">Photograph</p>
        <p className="mb-4 text-xs text-stone">
          Sits between the introduction and the form. Falls back to project photography.
        </p>
        <div className="max-w-md">
          <PageImageSlot
            page="contact"
            slot="hero"
            label="Contact photograph"
            aspect="aspect-[2/1]"
            current={image("contact", "hero")}
            fallbackUrl={hero.source === "automatic" ? hero.url : null}
            fallbackFrom={hero.from}
          />
        </div>
      </section>
    </div>
  );
}

export default function AdminContact() {
  return (
    <AdminProtected>
      <ContactBody />
    </AdminProtected>
  );
}
