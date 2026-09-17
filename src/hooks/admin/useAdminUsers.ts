import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listAdminUsers,
  inviteAdminUser,
  setAdminUserRole,
  revokeAdminAccess,
  deleteAdminUser,
} from "@/lib/admin-users.functions";

export type ManagedRole = "owner" | "editor";

export type ManagedUser = {
  id: string;
  email: string;
  role: string | null;
  createdAt: string;
  lastSignInAt: string | null;
  confirmed: boolean;
  isPlatformOwner: boolean;
  isLastOwner: boolean;
};

export type InviteResult = {
  userId: string;
  emailSent: boolean;
  password: string | null;
  actionLink: string | null;
  /** True when the address already existed and a recovery link was sent instead. */
  reinvited?: boolean;
};

export const ADMIN_USERS_KEY = ["admin", "users"];

/** Every call is a server function that re-checks the caller's role. */
export function useAdminUsers(enabled = true) {
  return useQuery({
    queryKey: ADMIN_USERS_KEY,
    enabled,
    queryFn: async () => {
      const data = await listAdminUsers();
      return data.users as ManagedUser[];
    },
  });
}

export function useInviteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; role: ManagedRole }) =>
      inviteAdminUser({ data: input }) as Promise<InviteResult>,
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_USERS_KEY }),
  });
}

export function useSetUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { userId: string; role: ManagedRole }) =>
      setAdminUserRole({ data: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_USERS_KEY }),
  });
}

export function useRevokeAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => revokeAdminAccess({ data: { userId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_USERS_KEY }),
  });
}

/** Irreversible. Deliberately separate from revoking access. */
export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => deleteAdminUser({ data: { userId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_USERS_KEY }),
  });
}
