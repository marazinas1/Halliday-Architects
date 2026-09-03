import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "@/lib/router-compat";
import { ArrowLeft, Eye, User } from "lucide-react";
import AdminProtected from "@/components/admin/AdminProtected";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useSaveTeamMember, useTeamMember, useAdminTeam } from "@/hooks/admin/useAdminTeam";
import {
  deleteTeamPhoto,
  getTeamPhotoUrl,
  uploadTeamPhoto,
} from "@/lib/admin/uploadTeamPhoto";
import { NotAnImageError } from "@/lib/images/optimizeImage";
import { openPreview } from "@/lib/admin/preview";

function AdminTeamFormInner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: existing, isLoading } = useTeamMember(id);
  const { data: allMembers } = useAdminTeam();
  const save = useSaveTeamMember();

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [credentials, setCredentials] = useState("");
  const [bio, setBio] = useState("");
  const [published, setPublished] = useState(true);
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!existing) return;
    setName(existing.name);
    setRole(existing.role);
    setCredentials(existing.credentials ?? "");
    setBio(existing.bio ?? "");
    setPublished(existing.published);
    setPhotoPath(existing.photo_path);
  }, [existing]);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    const previous = photoPath;
    try {
      const path = await uploadTeamPhoto(file, setProgress);
      setPhotoPath(path);
      // Replacing a photo removes the old file so nothing is orphaned.
      if (previous) await deleteTeamPhoto(previous);
      toast.success("Photo uploaded");
    } catch (e) {
      toast.error(
        e instanceof NotAnImageError ? e.message : `Upload failed: ${(e as Error).message}`,
      );
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async () => {
    if (!photoPath) return;
    try {
      await deleteTeamPhoto(photoPath);
      setPhotoPath(null);
      toast.success("Photo removed");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    const nextOrder =
      existing?.sort_order ??
      Math.max(0, ...(allMembers ?? []).map((m) => m.sort_order)) + 1;
    save.mutate(
      {
        id,
        name: name.trim(),
        role: role.trim(),
        credentials: credentials.trim() || null,
        bio: bio.trim() || null,
        photo_path: photoPath,
        published,
        sort_order: nextOrder,
      },
      {
        onSuccess: () => {
          toast.success("Saved");
          navigate("/admin/team");
        },
        onError: (err) => toast.error((err as Error).message),
      },
    );
  };

  if (id && isLoading) return <div className="text-stone py-16 text-center">Loading…</div>;

  // Previews the unsaved member exactly as the About-page studio card renders it.
  const preview = () =>
    openPreview("team", {
      id: id ?? "preview",
      name: name.trim() || "Team member",
      role: role.trim(),
      credentials: credentials.trim() || null,
      bio: bio.trim() || null,
      photo_url: photoPath ? getTeamPhotoUrl(photoPath) : null,
    });

  return (
    <form onSubmit={submit} className="space-y-6 max-w-2xl">
      <Link to="/admin/team" className="inline-flex items-center text-sm text-stone">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to team
      </Link>

      <h1 className="text-2xl font-semibold text-ink">
        {id ? "Edit team member" : "Add team member"}
      </h1>

      <div className="bg-card border border-line rounded-lg p-6 space-y-5">
        <div className="flex items-start gap-6">
          <div className="w-28 h-28 rounded-sm bg-sand flex items-center justify-center overflow-hidden shrink-0">
            {photoPath ? (
              <img
                src={getTeamPhotoUrl(photoPath)}
                alt={name ? `${name} headshot` : "Headshot preview"}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-7 h-7 text-stone/60" />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="photo">Photo</Label>
            <Input
              id="photo"
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <p className="text-xs text-stone">
              Any image. It is resized and converted to WebP automatically.
            </p>
            {uploading && <Progress value={progress} className="h-1.5" />}
            {photoPath && !uploading && (
              <Button type="button" variant="outline" size="sm" onClick={removePhoto}>
                Remove photo
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Principal"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="credentials">Credentials</Label>
            <Input
              id="credentials"
              value={credentials}
              onChange={(e) => setCredentials(e.target.value)}
              placeholder="RA, LEED AP"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" rows={6} value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>

        <div className="flex items-center gap-3">
          <Switch id="published" checked={published} onCheckedChange={setPublished} />
          <Label htmlFor="published">Published on the website</Label>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={save.isPending || uploading}>
          {save.isPending ? "Saving…" : "Save"}
        </Button>
        <Button type="button" variant="outline" onClick={preview} disabled={uploading}>
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate("/admin/team")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function AdminTeamForm() {
  return (
    <AdminProtected access="owner">
      <AdminTeamFormInner />
    </AdminProtected>
  );
}
