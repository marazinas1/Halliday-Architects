import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Link, useSearchParams } from "@/lib/router-compat";
import AdminProtected from "@/components/admin/AdminProtected";
import PageImageSlot from "@/components/admin/PageImageSlot";
import SectionTabs from "@/components/admin/SectionTabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { usePageContent } from "@/hooks/usePageContent";
import { useResolvedPageImages } from "@/hooks/useResolvedPageImages";
import { useSavePageText } from "@/hooks/admin/usePageContentAdmin";
import { ABOUT_PROSE_FALLBACKS } from "@/components/sections/AboutSection";
import { TeamManager } from "@/pages/admin/AdminTeam";
import { TestimonialsManager } from "@/pages/admin/AdminTestimonials";

/** Route-level tabs kept for the screens that still live on their own URL. */
export const ABOUT_TABS = [
  { label: "About page", to: "/admin/about" },
  { label: "Team", to: "/admin/about?tab=team", match: (p: string) => p.startsWith("/admin/team") },
  {
    label: "Testimonials",
    to: "/admin/about?tab=testimonials",
    match: (p: string) => p.startsWith("/admin/testimonials"),
  },
];

const IN_PAGE_TABS = [
  { label: "About page", value: "page" },
  { label: "Team", value: "team" },
  { label: "Testimonials", value: "testimonials" },
];

const FALLBACK_HEADING = "Residential architecture\nin Ocean City, New Jersey";
const FALLBACK_PROCESS = "One practice, from the first site visit to the last";

const PROSE_FIELDS = [
  { slot: "intro_1", label: "First paragraph" },
  { slot: "intro_2", label: "Second paragraph" },
  { slot: "intro_3", label: "Third paragraph" },
] as const;

function AboutBody() {
  const { image, copy, isLoading } = usePageContent();
  const { resolve } = useResolvedPageImages();
  const saveText = useSavePageText();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "page";

  const [values, setValues] = useState<Record<string, string>>({});
  const saved = [
    copy("about", "heading", ""),
    copy("about", "process_heading", ""),
    ...PROSE_FIELDS.map((f) => copy("about", f.slot, "")),
  ].join("␟");

  useEffect(() => {
    const [heading, process_heading, intro_1, intro_2, intro_3] = saved.split("␟");
    setValues({
      heading: heading ?? "",
      process_heading: process_heading ?? "",
      intro_1: intro_1 ?? "",
      intro_2: intro_2 ?? "",
      intro_3: intro_3 ?? "",
    });
  }, [saved]);

  const save = async () => {
    try {
      await saveText.mutateAsync({ page: "about", values });
      toast({ title: "Saved", description: "About page wording updated." });
    } catch (err) {
      toast({ variant: "destructive", title: "Could not save", description: (err as Error).message });
    }
  };

  const setTab = (value: string) => {
    if (value === "page") setParams({}, { replace: true });
    else setParams({ tab: value }, { replace: true });
  };

  const strip1 = resolve("about", "strip_1");
  const strip2 = resolve("about", "strip_2");

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
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

      <SectionTabs tabs={IN_PAGE_TABS} value={tab} onChange={setTab} />

      {tab === "team" && <TeamManager embedded />}
      {tab === "testimonials" && <TestimonialsManager embedded />}

      {tab === "page" && (
        <>
          <section className="mb-8 rounded-sm border border-line bg-card p-5">
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
              value={values["heading"] ?? ""}
              disabled={isLoading}
              placeholder={FALLBACK_HEADING}
              onChange={(e) => setValues((v) => ({ ...v, heading: e.target.value }))}
            />

            <p className="mb-2 mt-5 text-sm font-medium text-ink">Practice text</p>
            <div className="space-y-4">
              {PROSE_FIELDS.map((field) => (
                <div key={field.slot}>
                  <Label htmlFor={field.slot} className="text-xs text-stone">
                    {field.label}
                  </Label>
                  <Textarea
                    id={field.slot}
                    rows={4}
                    className="mt-1"
                    value={values[field.slot] ?? ""}
                    disabled={isLoading}
                    placeholder={ABOUT_PROSE_FALLBACKS[field.slot]}
                    onChange={(e) => setValues((v) => ({ ...v, [field.slot]: e.target.value }))}
                  />
                </div>
              ))}
            </div>

            <Label htmlFor="process" className="mt-5 block text-sm font-medium text-ink">
              "How we work" heading
            </Label>
            <Input
              id="process"
              className="mt-2"
              value={values["process_heading"] ?? ""}
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
                fallbackUrl={strip1.source === "automatic" ? strip1.url : null}
                fallbackFrom={strip1.from}
              />
              <PageImageSlot
                page="about"
                slot="strip_2"
                label="Right photograph"
                aspect="aspect-[5/4]"
                current={image("about", "strip_2")}
                fallbackUrl={strip2.source === "automatic" ? strip2.url : null}
                fallbackFrom={strip2.from}
              />
            </div>
          </section>
        </>
      )}
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
