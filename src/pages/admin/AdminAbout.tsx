import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import AdminProtected from "@/components/admin/AdminProtected";
import PageImageSlot from "@/components/admin/PageImageSlot";
import SectionTabs from "@/components/admin/SectionTabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { usePageContent } from "@/hooks/usePageContent";
import { useSavePageText } from "@/hooks/admin/usePageContentAdmin";

export const ABOUT_TABS = [
  { label: "About page", to: "/admin/about" },
  { label: "Team", to: "/admin/team", match: (p: string) => p.startsWith("/admin/team") },
  {
    label: "Testimonials",
    to: "/admin/testimonials",
    match: (p: string) => p.startsWith("/admin/testimonials"),
  },
];

const FALLBACK_HEADING = "Residential architecture\nin Ocean City, New Jersey";
const FALLBACK_PROCESS =
  "One practice, from the first site visit to the last";

function AboutBody() {
  const { image, copy, isLoading } = usePageContent();
  const saveText = useSavePageText();
  const { toast } = useToast();
  const [values, setValues] = useState({ heading: "", process_heading: "" });

  const heading = copy("about", "heading", "");
  const processHeading = copy("about", "process_heading", "");
  useEffect(() => {
    setValues({ heading, process_heading: processHeading });
  }, [heading, processHeading]);

  const save = async () => {
    try {
      await saveText.mutateAsync({ page: "about", values });
      toast({ title: "Saved", description: "About page wording updated." });
    } catch (err) {
      toast({ variant: "destructive", title: "Could not save", description: (err as Error).message });
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl text-ink">About</h1>
          <p className="text-sm text-stone">
            The practice page, the studio roster and the client quotes shown alongside it.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/about" target="_blank" rel="noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            View page
          </Link>
        </Button>
      </div>

      <SectionTabs tabs={ABOUT_TABS} />

      <section className="mb-8 rounded border border-line bg-card p-5">
        <p className="mb-4 text-sm font-medium text-ink">Wording</p>

        <Label htmlFor="heading" className="text-sm font-medium text-ink">
          Page heading
        </Label>
        <p className="mb-2 mt-1 text-xs text-stone">
          Use a line break to split it across two lines.
        </p>
        <Textarea
          id="heading"
          rows={2}
          value={values.heading}
          disabled={isLoading}
          placeholder={FALLBACK_HEADING}
          onChange={(e) => setValues((v) => ({ ...v, heading: e.target.value }))}
        />

        <Label htmlFor="process" className="mt-5 block text-sm font-medium text-ink">
          "How we work" heading
        </Label>
        <Input
          id="process"
          className="mt-2"
          value={values.process_heading}
          disabled={isLoading}
          placeholder={FALLBACK_PROCESS}
          onChange={(e) => setValues((v) => ({ ...v, process_heading: e.target.value }))}
        />

        <div className="mt-5 flex items-center gap-3">
          <Button onClick={save} disabled={saveText.isPending}>
            Save wording
          </Button>
          <span className="text-xs text-stone">Empty fields keep the wording shown in grey.</span>
        </div>
      </section>

      <section>
        <p className="mb-1 text-sm font-medium text-ink">Photographs</p>
        <p className="mb-4 text-xs text-stone">
          The pair of photographs between the practice text and "How we work".
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <PageImageSlot
            page="about"
            slot="strip_1"
            label="Left photograph"
            aspect="aspect-[7/5]"
            current={image("about", "strip_1")}
          />
          <PageImageSlot
            page="about"
            slot="strip_2"
            label="Right photograph"
            aspect="aspect-[5/4]"
            current={image("about", "strip_2")}
          />
        </div>
      </section>
    </div>
  );
}

export default function AdminAbout() {
  return (
    <AdminProtected>
      <AboutBody />
    </AdminProtected>
  );
}
