import { useState } from "react";
import { Copy, Loader2, ShieldCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";

import AdminProtected from "@/components/admin/AdminProtected";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useAdminUsers,
  useInviteUser,
  useSetUserRole,
  useRevokeAccess,
  useDeleteUser,
  type InviteResult,
  type ManagedRole,
  type ManagedUser,
} from "@/hooks/admin/useAdminUsers";
import { useAdminAuth } from "@/hooks/admin/useAdminAuth";


const ROLE_LABEL: Record<string, string> = {
  developer: "Developer",
  owner: "Owner",
  editor: "Editor",
  admin: "Legacy admin",
};

function AdminUsersInner() {
  const auth = useAdminAuth();
  const currentUserId = auth.status === "authorized" ? auth.userId : null;
  const { data: users = [], isLoading, error } = useAdminUsers();
  const invite = useInviteUser();
  const setRole = useSetUserRole();
  const revoke = useRevokeAccess();
  const remove = useDeleteUser();


  const [email, setEmail] = useState("");
  const [role, setRoleValue] = useState<ManagedRole>("editor");
  const [result, setResult] = useState<(InviteResult & { email: string }) | null>(null);
  const [toRevoke, setToRevoke] = useState<ManagedUser | null>(null);
  const [toDelete, setToDelete] = useState<ManagedUser | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [resendingId, setResendingId] = useState<string | null>(null);

  const copy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  };

  /**
   * Re-sends the invitation for an account that exists but was never activated.
   * The backend routes this through its re-invite branch, which emails the
   * password link and still returns it for manual handover if sending fails.
   */
  const resendInvite = (user: ManagedUser) => {
    const targetRole: ManagedRole =
      user.role === "owner" || user.role === "editor" ? user.role : role;
    setResendingId(user.id);
    invite.mutate(
      { email: user.email, role: targetRole },
      {
        onSuccess: (data) => {
          setResendingId(null);
          toast.success(
            data.emailSent
              ? `Invitation resent to ${user.email}.`
              : `Invitation link generated for ${user.email} — send it manually.`,
          );
          if (data.actionLink || data.password) {
            setResult({ ...data, email: user.email });
          }
        },
        onError: (err: Error) => {
          setResendingId(null);
          toast.error(err.message);
        },
      },
    );
  };


  const submitInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const address = email.trim();
    if (!address) return;
    invite.mutate(
      { email: address, role },
      {
        onSuccess: (data) => {
          setResult({ ...data, email: address });
          setEmail("");
          toast.success(
            data.reinvited
              ? "Account already existed — reset link generated below"
              : data.emailSent
                ? "Invitation sent"
                : "Account created — share the credentials below",
          );
        },
        onError: (err: Error) => toast.error(err.message),
      },
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Users</h1>
        <p className="mt-2 text-sm text-stone">
          Owners manage everything. Editors can only work on projects and the blog.
        </p>
      </header>

      <section className="rounded-lg border border-line bg-card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-stone">Invite someone</h2>
        <form onSubmit={submitInvite} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Input
            type="email"
            required
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="sm:flex-1"
          />
          <Select value={role} onValueChange={(v) => setRoleValue(v as ManagedRole)}>
            <SelectTrigger className="sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" disabled={invite.isPending}>
            {invite.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            Invite
          </Button>
        </form>

        {result && (
          <div className="mt-6 rounded-md border border-line bg-sand p-4 text-sm">
            <p className="font-medium text-ink">
              {result.reinvited
                ? `${result.email} already has an account, so a password reset link has been generated. Copy it and send it to them directly. Their existing role was left unchanged.`
                : result.emailSent
                  ? `An invitation email was sent to ${result.email}.`
                  : `Account created for ${result.email}. Email delivery isn't available yet, so pass these on yourself.`}
            </p>
            {result.password && (
              <div className="mt-3 flex items-center gap-2">
                <code className="flex-1 truncate rounded bg-card px-3 py-2 text-xs">
                  {result.password}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copy(result.password!, "Password")}
                >
                  <Copy className="h-3.5 w-3.5" /> Password
                </Button>
              </div>
            )}
            {result.actionLink && (
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 truncate rounded bg-card px-3 py-2 text-xs">
                  {result.actionLink}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copy(result.actionLink!, "Link")}
                >
                  <Copy className="h-3.5 w-3.5" /> Link
                </Button>
              </div>
            )}
            <p className="mt-3 text-xs text-stone">
              This is shown once. Ask them to set their own password after signing in.
            </p>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-line bg-card">
        <div className="border-b border-line px-6 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone">Accounts</h2>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-stone" />
          </div>
        )}

        {error && (
          <p className="px-6 py-8 text-sm text-destructive">{(error as Error).message}</p>
        )}

        {!isLoading && !error && (
          <ul className="divide-y divide-line">
            {users.map((user) => {
              const isSelf = Boolean(currentUserId) && user.id === currentUserId;
              const selfTitle = "You cannot change your own access.";
              return (
              <li key={user.id} className="flex flex-col gap-3 px-4 py-4 sm:px-6 md:flex-row md:flex-wrap md:items-center">
                <div className="min-w-0 w-full md:flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-ink">{user.email}</span>
                    {isSelf && (
                      <Badge variant="outline" className="gap-1">
                        <ShieldCheck className="h-3 w-3" /> You
                      </Badge>
                    )}
                    {user.isLastOwner && (
                      <Badge variant="outline" className="gap-1">
                        <ShieldCheck className="h-3 w-3" /> Last owner
                      </Badge>
                    )}
                    {user.isPlatformOwner && (
                      <Badge variant="outline" className="gap-1">
                        <ShieldCheck className="h-3 w-3" /> Developer
                      </Badge>
                    )}
                    {!user.confirmed && <Badge variant="outline">Invited</Badge>}
                  </div>
                  <div className="mt-1 text-xs text-stone">
                    {user.role ? ROLE_LABEL[user.role] ?? user.role : "No access"} ·{" "}
                    {user.lastSignInAt
                      ? `Last signed in ${new Date(user.lastSignInAt).toLocaleDateString()}`
                      : "Never signed in"}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <Select
                  value={user.role === "owner" || user.role === "editor" ? user.role : undefined}
                  disabled={isSelf || user.isPlatformOwner || user.isLastOwner || setRole.isPending}
                  onValueChange={(v) =>
                    setRole.mutate(
                      { userId: user.id, role: v as ManagedRole },
                      {
                        onSuccess: () => toast.success("Role updated"),
                        onError: (err: Error) => toast.error(err.message),
                      },
                    )
                  }
                >
                  <SelectTrigger
                    className="w-full sm:w-36"
                    title={
                      isSelf
                        ? selfTitle
                        : user.isPlatformOwner
                          ? "Managed by the developer"
                          : undefined
                    }
                  >
                    <SelectValue placeholder="No access" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>

                {!user.confirmed && !isSelf && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={invite.isPending && resendingId === user.id}
                    title="Send the invitation email again"
                    onClick={() => resendInvite(user)}
                  >
                    {invite.isPending && resendingId === user.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Resend invitation"
                    )}
                  </Button>
                )}



                <Button
                  variant="outline"
                  size="sm"
                  disabled={isSelf || user.isPlatformOwner || user.isLastOwner || !user.role}
                  title={
                    isSelf
                      ? selfTitle
                      : user.isPlatformOwner
                        ? "Managed by the developer"
                        : user.isLastOwner
                          ? "At least one owner account must remain"
                          : "Remove access"
                  }
                  onClick={() => setToRevoke(user)}
                >
                  Remove access
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  disabled={isSelf || user.isPlatformOwner || user.isLastOwner}
                  title={
                    isSelf
                      ? selfTitle
                      : user.isPlatformOwner
                        ? "Managed by the developer"
                        : undefined
                  }
                  onClick={() => {
                    setDeleteConfirm("");
                    setToDelete(user);
                  }}
                >
                  Delete
                </Button>
                </div>
              </li>
              );
            })}
            {users.length === 0 && (
              <li className="px-6 py-10 text-center text-sm text-stone">No accounts yet.</li>
            )}
          </ul>
        )}
      </section>

      {/* Revoking keeps the account; only the role is removed. */}
      <AlertDialog open={Boolean(toRevoke)} onOpenChange={(o) => !o && setToRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove access for {toRevoke?.email}?</AlertDialogTitle>
            <AlertDialogDescription>
              Their account stays, but they will no longer be able to open the admin panel. You can
              give access back at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                toRevoke &&
                revoke.mutate(toRevoke.id, {
                  onSuccess: () => toast.success("Access removed"),
                  onError: (err: Error) => toast.error(err.message),
                })
              }
            >
              Remove access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={Boolean(toDelete)} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {toDelete?.email}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the account and cannot be undone. Projects, blog posts and
              images are not affected. Type <strong>DELETE</strong> to confirm.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="DELETE"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteConfirm !== "DELETE"}
              onClick={() =>
                toDelete &&
                remove.mutate(toDelete.id, {
                  onSuccess: () => toast.success("Account deleted"),
                  onError: (err: Error) => toast.error(err.message),
                })
              }
            >
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AdminUsers() {
  return (
    <AdminProtected access="owner">
      <AdminUsersInner />
    </AdminProtected>
  );
}
