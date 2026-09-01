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
import { useResolvedPageImages } from "@/hooks/useResolvedPageImages";
import { useSavePageText } from "@/hooks/admin/usePageContentAdmin";
import { HOMEPAGE_FALLBACKS } from "@/hooks/useSiteSettings";

const WALL_SLOTS = [
  { slot: "wall_1", label: "Opening photograph", help: "Full width, the first thing visitors see.", aspect: "aspect-[16/9]" },
  { slot: "wall_2", label: "Second photograph (left)", help: "The wider of the two side by side.", aspect: "aspect-[7/5]" },
  { slot: "wall_3", label: "Third photograph (right)", help: "The narrower of the two.", aspect: "aspect-[5/4]" },
  { slot: "wall_4", label: "Closing photograph", help: "Full width, below the pair.", aspect: "aspect-[16/9]" },
];

const TILE_SLOTS = [
  { slot: "tile_projects", label: "Projects tile", textSlot: "tile_projects_label", fallbackLabel: "Projects" },
  { slot: "tile_about", label: "About tile", textSlot: "tile_about_label", fallbackLabel: "About" },
  { slot: "tile_contact", label: "Contact tile", textSlot: "tile_contact_label", fallbackLabel: "Contact" },
];

function HomeBody() {
  const { image, copy, isLoading } = usePageContent();
  const { resolve } = useResolvedPageImages();
  const saveText = useSavePageText();
  const { toast } = useToast();
  const [statement, setStatement] = useState("");
  const [labels, setLabels] = useState<Record<string, string>>({});

  const savedStatement = copy("home", "intro_heading", "");
  const savedLabels = TILE_SLOTS.map((t) => copy("home", t.textSlot, "")).join("|");
  useEffect(() => {
    setStatement(savedStatement);
  }, [savedStatement]);
  useEffect(() => {
    const next: Record<string, string> = {};
    TILE_SLOTS.forEach((t, i) => {
      next[t.textSlot] = savedLabels.split("|")[i] ?? "";
    });
    setLabels(next);
  }, [savedLabels]);

  const save = async () => {
    try {
      await saveText.mutateAsync({
        page: "home",
        values: { intro_heading: statement, ...labels },
      });
      toast({ title: "Saved", description: "Homepage wording updated." });
    } catch (err) {
      toast({ variant: "destructive", title: "Could not save", description: (err as Error).message });
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl text-ink">Home</h1>
          <p className="text-sm text-stone">
            The photo wall, the practice statement and the three tiles at the foot of the page.
            Every panel below shows the photograph on the live page — those marked "Automatic"
            come from project photography until you choose your own.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/" target="_blank" rel="noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            View page
          </Link>
        </Button>
      </div>

      <section className="mb-8">
        <p className="mb-1 text-sm font-medium text-ink">Photo wall</p>
        <p className="mb-4 text-xs text-stone">Four photographs, in the order they appear.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {WALL_SLOTS.map((s) => {
            const shown = resolve("home", s.slot);
            return (
              <PageImageSlot
                key={s.slot}
                page="home"
                slot={s.slot}
                label={s.label}
                help={s.help}
                aspect={s.aspect}
                current={image("home", s.slot)}
                fallbackUrl={shown.source === "automatic" ? shown.url : null}
                fallbackFrom={shown.from}
              />
            );
          })}
        </div>
      </section>

      <section className="mb-8 rounded border border-line bg-card p-5">
        <Label htmlFor="statement" className="text-sm font-medium text-ink">
          Practice statement
        </Label>
        <p className="mb-2 mt-1 text-xs text-stone">
          The centred sentence between the photo wall and the tiles.
        </p>
        <Textarea
          id="statement"
          rows={3}
          value={statement}
          disabled={isLoading}
          placeholder={HOMEPAGE_FALLBACKS.introHeading}
          onChange={(e) => setStatement(e.target.value)}
        />

        <p className="mb-2 mt-5 text-sm font-medium text-ink">Tile wording</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {TILE_SLOTS.map((t) => (
            <div key={t.textSlot}>
              <Label htmlFor={t.textSlot} className="text-xs text-stone">
                {t.label}
              </Label>
              <Input
                id={t.textSlot}
                className="mt-1"
                value={labels[t.textSlot] ?? ""}
                disabled={isLoading}
                placeholder={t.fallbackLabel}
                onChange={(e) => setLabels((v) => ({ ...v, [t.textSlot]: e.target.value }))}
              />
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Button onClick={save} disabled={saveText.isPending}>
            Save wording
          </Button>
          <span className="text-xs text-stone">Left empty, the wording shown in grey is used.</span>
        </div>
      </section>

      <section>
        <p className="mb-1 text-sm font-medium text-ink">Tiles</p>
        <p className="mb-4 text-xs text-stone">
          The three linked panels at the foot of the homepage.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {TILE_SLOTS.map((s) => {
            const shown = resolve("home", s.slot);
            return (
              <PageImageSlot
                key={s.slot}
                page="home"
                slot={s.slot}
                label={s.label}
                aspect="aspect-[3/4]"
                current={image("home", s.slot)}
                fallbackUrl={shown.source === "automatic" ? shown.url : null}
                fallbackFrom={shown.from}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default function AdminHome() {
  return (
    <AdminProtected>
      <HomeBody />
    </AdminProtected>
  );
}
