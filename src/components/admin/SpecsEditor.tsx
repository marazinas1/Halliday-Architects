import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SPEC_ICON_KEYS } from "@/lib/specIcons";

export type SpecItem = { icon: string; title: string; description: string };

// Re-exported for backward compatibility with existing imports.
export const SPEC_ICONS = SPEC_ICON_KEYS;

export default function SpecsEditor({
  value,
  onChange,
}: {
  value: SpecItem[];
  onChange: (v: SpecItem[]) => void;
}) {
  const update = (i: number, patch: Partial<SpecItem>) => {
    const next = [...value];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const add = () =>
    onChange([...value, { icon: "kitchen", title: "", description: "" }]);

  return (
    <div className="space-y-3">
      {value.map((spec, i) => (
        <div
          key={i}
          className="grid grid-cols-1 md:grid-cols-[160px_1fr_2fr_40px] gap-3 items-start p-3 rounded border border-slate-200"
        >
          <Select value={spec.icon} onValueChange={(v) => update(i, { icon: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SPEC_ICON_KEYS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={spec.title}
            onChange={(e) => update(i, { title: e.target.value })}
            placeholder="Title"
          />
          <Textarea
            value={spec.description}
            onChange={(e) => update(i, { description: e.target.value })}
            placeholder="Description"
            rows={2}
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="w-4 h-4 mr-2" />
        Add spec
      </Button>
    </div>
  );
}