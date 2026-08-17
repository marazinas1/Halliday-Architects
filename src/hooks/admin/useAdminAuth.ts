import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AdminAuthState =
  | { status: "loading" }
  | { status: "unauthorized" }
  | { status: "admin"; userId: string; email: string };

export function useAdminAuth(): AdminAuthState {
  const [state, setState] = useState<AdminAuthState>({ status: "loading" });
  const stateRef = useRef<AdminAuthState>(state);
  stateRef.current = state;

  useEffect(() => {
    let active = true;

    // `background` = true means: never flip UI to "loading". Only transition
    // admin -> unauthorized if the role check fails. This keeps the admin
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
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!active) return;
      if (!roleRow) {
        await supabase.auth.signOut();
        setState({ status: "unauthorized" });
        return;
      }
      const next: AdminAuthState = {
        status: "admin",
        userId: userData.user.id,
        email: userData.user.email ?? "",
      };
      // Avoid needless re-renders on background re-verify.
      const prev = stateRef.current;
      if (
        background &&
        prev.status === "admin" &&
        prev.userId === next.userId &&
        prev.email === next.email
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
      // Re-verify the role in the background instead. If the role has been
      // revoked, `check()` will transition admin -> unauthorized.
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