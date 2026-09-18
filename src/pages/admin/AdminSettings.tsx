import SettingsTabs from "@/components/admin/SettingsTabs";
import { useEffect, useRef, useState } from "react";
import AdminSection from "@/components/admin/AdminSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import {
  useSiteSettings,
  FALLBACK_LOGO,
  MAINTENANCE_FALLBACK_MESSAGE,
} from "@/hooks/useSiteSettings";
import { useSaveSiteSettings } from "@/hooks/admin/useSiteSettingsAdmin";
import {
  uploadBrandAsset,
  deleteBrandAsset,
  getBrandAssetUrl,
  type BrandAssetKind,
} from "@/lib/admin/uploadBrandAsset";
import { NotAnImageError } from "@/lib/images/optimizeImage";

type ContactKey =
  | "address_line1"
  | "address_line2"
  | "mailing_line1"
  | "mailing_line2"
  | "phone"
  | "fax"
  | "email"
  | "instagram_url"
  | "office_hours";

const CONTACT_FIELDS: { key: ContactKey; label: string; placeholder: string }[] = [
  { key: "address_line1", label: "Street address", placeholder: "728 West Avenue, Suite A" },
  { key: "address_line2", label: "City, state and ZIP", placeholder: "Ocean City, NJ 08226" },
  { key: "mailing_line1", label: "Mailing address", placeholder: "P.O. Box 186" },
  { key: "mailing_line2", label: "Mailing city, state and ZIP", placeholder: "Ocean City, NJ 08226" },
  { key: "phone", label: "Phone", placeholder: "609.957.6789" },
  { key: "fax", label: "Fax", placeholder: "609.337.1758" },
  { key: "email", label: "Email", placeholder: "chris@hallidayarchitects.com" },
  { key: "instagram_url", label: "Instagram", placeholder: "https://www.instagram.com/…" },
  { key: "office_hours", label: "Opening days", placeholder: "Monday – Friday" },
];

type SlotKey = "logo_path" | "logo_dark_path" | "favicon_path";

const SLOTS: { key: SlotKey; kind: BrandAssetKind; label: string; help: string; dark?: boolean }[] = [
  { key: "logo_path", kind: "logo", label: "Logo", help: "Used on light backgrounds. PNG with transparency works best." },
  { key: "logo_dark_path", kind: "logo_dark", label: "Dark-background logo", help: "Optional. Without it, the main logo is knocked out to white." , dark: true },
  { key: "favicon_path", kind: "favicon", label: "Favicon", help: "Square. Shown in the browser tab." },
];

function AssetSlot({
  label,
  help,
  url,
  hasUpload,
  dark,
  busy,
  progress,
  onPick,
  onRemove,
}: {
  label: string;
  help: string;
  url: string | null;
  hasUpload: boolean;
  dark?: boolean | undefined;
  busy: boolean;
  progress: number;
  onPick: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="border border-border rounded-sm bg-card p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 mb-4">
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground mt-1">{help}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
            {hasUpload ? "Replace" : "Upload"}
          </Button>
          {hasUpload && (
            <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={onRemove}>
              Remove
            </Button>
          )}
        </div>
      </div>

      <div
        className={`h-24 rounded-sm flex items-center justify-center px-6 ${dark ? "bg-primary" : "bg-muted"}`}
      >
        {url ? (
          <img src={url} alt={label} className="max-h-14 w-auto" />
        ) : (
          <span className={`text-xs ${dark ? "text-primary-foreground/50" : "text-muted-foreground"}`}>Nothing uploaded</span>
        )}
      </div>

      {busy && <Progress value={progress} className="mt-3 h-1" />}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) onPick(file);
        }}
      />
    </div>
  );
}

function SettingsBody() {
  const { settings, isLoading } = useSiteSettings();
  const save = useSaveSiteSettings();
  const { toast } = useToast();
  const [siteName, setSiteName] = useState("");
  const [notifyEmails, setNotifyEmails] = useState("");
  const [contact, setContact] = useState({
    address_line1: "",
    address_line2: "",
    mailing_line1: "",
    mailing_line2: "",
    phone: "",
    fax: "",
    email: "",
    instagram_url: "",
    office_hours: "",
  });
  const [maintenance, setMaintenance] = useState({ enabled: false, message: "" });
  const [busyKey, setBusyKey] = useState<SlotKey | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (settings.row) {
      setSiteName(settings.row.site_name);
      setNotifyEmails(settings.row.inquiry_notify_emails ?? "");
      setContact({
        address_line1: settings.row.address_line1 ?? "",
        address_line2: settings.row.address_line2 ?? "",
        mailing_line1: settings.row.mailing_line1 ?? "",
        mailing_line2: settings.row.mailing_line2 ?? "",
        phone: settings.row.phone ?? "",
        fax: settings.row.fax ?? "",
        email: settings.row.email ?? "",
        instagram_url: settings.row.instagram_url ?? "",
        office_hours: settings.row.office_hours ?? "",
      });
      setMaintenance({
        enabled: Boolean(settings.row.maintenance_mode),
        message: settings.row.maintenance_message ?? "",
      });
    } else if (!isLoading) {
      setSiteName(settings.siteName);
    }
  }, [settings.row, settings.siteName, isLoading]);

  const rowId = settings.row?.id ?? null;
  const pathFor = (key: SlotKey) => settings.row?.[key] ?? null;

  const urlFor = (key: SlotKey) => {
    const path = pathFor(key);
    if (path) return getBrandAssetUrl(path);
    return key === "logo_path" ? FALLBACK_LOGO : null;
  };

  const handleUpload = async (key: SlotKey, kind: BrandAssetKind, file: File) => {
    setBusyKey(key);
    setProgress(0);
    try {
      const previous = pathFor(key);
      const path = await uploadBrandAsset(file, kind, setProgress);
      await save.mutateAsync({ id: rowId, patch: { site_name: siteName, [key]: path } });
      await deleteBrandAsset(previous);
      toast({ title: "Saved", description: `${key === "favicon_path" ? "Favicon" : "Logo"} updated.` });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description:
          err instanceof NotAnImageError ? err.message : (err as Error).message ?? "Please try again.",
      });
    } finally {
      setBusyKey(null);
      setProgress(0);
    }
  };

  const handleRemove = async (key: SlotKey) => {
    setBusyKey(key);
    try {
      const previous = pathFor(key);
      await save.mutateAsync({ id: rowId, patch: { site_name: siteName, [key]: null } });
      await deleteBrandAsset(previous);
      toast({ title: "Removed" });
    } catch (err) {
      toast({ variant: "destructive", title: "Could not remove", description: (err as Error).message });
    } finally {
      setBusyKey(null);
    }
  };

  const handleSaveName = async () => {
    try {
      await save.mutateAsync({ id: rowId, patch: { site_name: siteName.trim() } });
      toast({ title: "Saved", description: "Site name updated." });
    } catch (err) {
      toast({ variant: "destructive", title: "Could not save", description: (err as Error).message });
    }
  };

  const handleSaveContact = async () => {
    try {
      const patch = Object.fromEntries(
        Object.entries(contact).map(([key, value]) => [key, value.trim() || null]),
      );
      await save.mutateAsync({ id: rowId, patch });
      toast({ title: "Saved", description: "Business details updated." });
    } catch (err) {
      toast({ variant: "destructive", title: "Could not save", description: (err as Error).message });
    }
  };

  const handleSaveMaintenance = async (next: { enabled: boolean; message: string }) => {
    setMaintenance(next);
    try {
      await save.mutateAsync({
        id: rowId,
        patch: {
          maintenance_mode: next.enabled,
          maintenance_message: next.message.trim() || null,
        },
      });
      toast({
        title: next.enabled ? "Maintenance mode on" : "Maintenance mode off",
        description: next.enabled
          ? "Visitors now see a holding page. You and your team still see the site."
          : "The site is open to visitors again.",
      });
    } catch (err) {
      toast({ variant: "destructive", title: "Could not save", description: (err as Error).message });
    }
  };

  const handleSaveNotifyEmails = async () => {
    try {
      const value = notifyEmails.trim();
      await save.mutateAsync({ id: rowId, patch: { inquiry_notify_emails: value || null } });
      toast({ title: "Saved", description: "Inquiry notification recipients updated." });
    } catch (err) {
      toast({ variant: "destructive", title: "Could not save", description: (err as Error).message });
    }
  };

  return (
    <div className="w-full">
      <SettingsTabs />
      <h1 className="text-2xl text-foreground mb-1">Settings</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Branding used across the public site, the admin and the sign-in screen.
      </p>

      <div className="border border-border rounded-sm bg-card p-5 mb-6">
        <Label htmlFor="site-name" className="text-sm font-medium text-foreground">
          Site name
        </Label>
        <div className="flex gap-3 mt-3">
          <Input
            id="site-name"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="Halliday Architects"
          />
          <Button onClick={handleSaveName} disabled={save.isPending || !siteName.trim()}>
            Save
          </Button>
        </div>
      </div>

      <div className="border border-border rounded-sm bg-card p-5 mb-6">
        <Label htmlFor="notify-emails" className="text-sm font-medium text-foreground">
          Inquiry notifications
        </Label>
        <p className="text-xs text-muted-foreground mt-1">
          Where contact form submissions are emailed. Separate several addresses with commas.
        </p>
        <div className="flex gap-3 mt-3">
          <Input
            id="notify-emails"
            value={notifyEmails}
            onChange={(e) => setNotifyEmails(e.target.value)}
            placeholder="chris@hallidayarchitects.com, shannon@hallidayarchitects.com"
          />
          <Button onClick={handleSaveNotifyEmails} disabled={save.isPending}>
            Save
          </Button>
        </div>
      </div>

      <div className="border border-border rounded-sm bg-card p-5 mb-6">
        <p className="text-sm font-medium text-foreground">Business details</p>
        <p className="text-xs text-muted-foreground mt-1">
          Shown in the footer, the menu panel and on the contact page.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {CONTACT_FIELDS.map((field) => (
            <div key={field.key}>
              <Label htmlFor={field.key} className="text-xs text-muted-foreground">
                {field.label}
              </Label>
              <Input
                id={field.key}
                className="mt-1"
                value={contact[field.key]}
                placeholder={field.placeholder}
                onChange={(e) => setContact((prev) => ({ ...prev, [field.key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <Button className="mt-4" onClick={handleSaveContact} disabled={save.isPending}>
          Save
        </Button>
      </div>

      <div className="border border-border rounded-sm bg-card p-5 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Maintenance mode</p>
            <p className="text-xs text-muted-foreground mt-1">
              Visitors see a short holding page instead of the site. You and your team keep full
              access while signed in.
            </p>
          </div>
          <Switch
            checked={maintenance.enabled}
            onCheckedChange={(checked) =>
              handleSaveMaintenance({ ...maintenance, enabled: checked })
            }
            aria-label="Maintenance mode"
          />
        </div>
        <div className="mt-4">
          <Label htmlFor="maintenance-message" className="text-xs text-muted-foreground">
            Message shown to visitors
          </Label>
          <div className="flex gap-3 mt-1">
            <Input
              id="maintenance-message"
              value={maintenance.message}
              placeholder={MAINTENANCE_FALLBACK_MESSAGE}
              onChange={(e) => setMaintenance((prev) => ({ ...prev, message: e.target.value }))}
            />
            <Button
              variant="outline"
              onClick={() => handleSaveMaintenance(maintenance)}
              disabled={save.isPending}
            >
              Save
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {SLOTS.map((slot) => (
          <AssetSlot
            key={slot.key}
            label={slot.label}
            help={slot.help}
            dark={slot.dark}
            url={urlFor(slot.key)}
            hasUpload={Boolean(pathFor(slot.key))}
            busy={busyKey === slot.key}
            progress={progress}
            onPick={(file) => handleUpload(slot.key, slot.kind, file)}
            onRemove={() => handleRemove(slot.key)}
          />
        ))}
      </div>

      <div className="mt-10">
        <p className="text-sm font-medium text-foreground mb-3">Preview</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-sm border border-border bg-background h-32 flex items-center justify-center">
            <img src={urlFor("logo_path") ?? FALLBACK_LOGO} alt="Logo on light" className="max-h-12 w-auto" />
          </div>
          <div className="rounded-sm border border-border bg-primary h-32 flex items-center justify-center">
            <img
              src={urlFor("logo_dark_path") ?? urlFor("logo_path") ?? FALLBACK_LOGO}
              alt="Logo on dark"
              className="max-h-12 w-auto"
              style={pathFor("logo_dark_path") ? undefined : { filter: "brightness(0) invert(1)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminSettings() {
  return (
    <AdminSection access="owner">
      <SettingsBody />
    </AdminSection>
  );
}
