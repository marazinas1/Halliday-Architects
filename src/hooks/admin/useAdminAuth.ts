import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AdminRole = "platform_owner" | "owner" | "editor";
/** Sections an editor may not reach. */
export type AdminAccess = "staff" | "owner";

export type AdminAuthState =
  | { status: "loading" }
  | { status: "unauthorized" }
  | { status: "authorized"; userId: string; email: string; role: AdminRole };

const STAFF_ROLES: AdminRole[] = ["platform_owner", "owner", "editor"];

export function isOwnerRole(role: AdminRole) {
  return role === "platform_owner" || role === "owner";
}

export function canAccess(role: AdminRole, access: AdminAccess) {
  return access === "owner" ? isOwnerRole(role) : true;
}

export function useAdminAuth(): AdminAuthState {
  const [state, setState] = useState<AdminAuthState>({ status: "loading" });
  const stateRef = useRef<AdminAuthState>(state);
  stateRef.current = state;

  useEffect(() => {
    let active = true;

    // `background` = true means: never flip UI to "loading". Only transition
    // authorized -> unauthorized if the role check fails. This keeps the admin
    // subtree mounted across TOKEN_REFRESHED events (which fire on tab focus)
    // and prevents form state from being wiped.
    const check = async (background = false) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      if (!session) {
        setState({ status: "unauthorized" });
        return;
      }
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (!active) return;
      if (userError || !userData.user) {
        setState({ status: "unauthorized" });
        return;
      }
      const { data: roleRows } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id);
      if (!active) return;
      const role = (roleRows ?? [])
        .map((r) => r.role as AdminRole)
        .find((r) => STAFF_ROLES.includes(r));
      if (!role) {
        await supabase.auth.signOut();
        setState({ status: "unauthorized" });
        return;
      }
      const next: AdminAuthState = {
        status: "authorized",
        userId: userData.user.id,
        email: userData.user.email ?? "",
        role,
      };
      // Avoid needless re-renders on background re-verify.
      const prev = stateRef.current;
      if (
        background &&
        prev.status === "authorized" &&
        prev.userId === next.userId &&
        prev.email === next.email &&
        prev.role === next.role
      ) {
        return;
      }
      setState(next);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setState({ status: "unauthorized" });
        return;
      }
      // Never flip back to "loading" after the initial mount check —
      // that unmounts the admin subtree and wipes in-flight form state
      // whenever the browser fires TOKEN_REFRESHED (e.g. on tab focus).
      check(true);
    });

    check();
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
