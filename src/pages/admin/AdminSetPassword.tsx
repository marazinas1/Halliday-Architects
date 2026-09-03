import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AuthSplit from "@/components/brand/AuthSplit";
import AuthCard from "@/components/brand/AuthCard";
import BrandLogo from "@/components/BrandLogo";

const inputClass =
  "w-full px-4 py-3 bg-background border border-input rounded-sm text-ink focus:outline-hidden focus:ring-1 focus:ring-ink transition";
const labelClass = "block text-xs tracking-[0.2em] uppercase text-stone";

type ReadyState = "waiting" | "ready" | "expired";

const AdminSetPassword = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<ReadyState>("waiting");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Recovery vs. invite — Supabase appends type=recovery|invite to the link.
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type");
  const isRecovery = type === "recovery";
  const title = isRecovery ? "Choose a new password" : "Set your password";

  useEffect(() => {
    let active = true;
    let settled = false;

    const markReady = (ok: boolean) => {
      if (!active || settled) return;
      settled = true;
      setState(ok ? "ready" : "expired");
    };

    const establishSession = async () => {
      try {
        // 1. Hash fragment — access_token + refresh_token (implicit flow).
        const hash = window.location.hash.replace(/^#/, "");
        const hashParams = new URLSearchParams(hash);
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            markReady(false);
            return;
          }
          // Strip credentials from the address bar.
          window.history.replaceState({}, "", window.location.pathname);
          markReady(true);
          return;
        }

        // 2. Query string — code parameter (PKCE flow).
        const code = params.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            markReady(false);
            return;
          }
          window.history.replaceState({}, "", window.location.pathname);
          markReady(true);
          return;
        }

        // 3. Maybe a session already exists (returning user).
        const { data: { session } } = await supabase.auth.getSession();
        if (active && session) {
          markReady(true);
          return;
        }
      } catch {
        markReady(false);
        return;
      }

      // Nothing yet — let onAuthStateChange resolve it, but bail after a timeout.
      const timer = window.setTimeout(() => markReady(false), 6000);
      return () => window.clearTimeout(timer);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        if (session) markReady(true);
      }
    });

    let cleanup: (() => void) | undefined;
    establishSession().then((c) => {
      cleanup = c;
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the password.");
      setLoading(false);
    }
  };

  return (
    <AuthSplit>
      <div className="md:hidden mb-10">
        <BrandLogo className="h-10 w-auto" />
      </div>
      <AuthCard eyebrow="Administrator" title={title}>
        {state === "waiting" ? (
          <p className="text-sm text-stone">
            Opening your secure link…
          </p>
        ) : state === "expired" ? (
          <div className="space-y-6">
            <p className="text-sm text-stone">
              This link has expired or has already been used. Ask for a new
              invitation, or use Forgot password on the sign-in page.
            </p>
            <Link
              to="/admin/login"
              className="inline-flex items-center justify-center w-full px-8 py-3 text-sm font-medium tracking-wider uppercase bg-ink text-paper rounded-sm hover:bg-ink/90 transition"
            >
              Go to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="new-password" className={labelClass}>
                New password
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className={labelClass}>
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={inputClass}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-8 py-3 text-sm font-medium tracking-wider uppercase bg-ink text-paper rounded-sm hover:bg-ink/90 transition disabled:opacity-60"
            >
              {loading ? "Saving…" : "Save Password"}
            </button>
          </form>
        )}
      </AuthCard>
      <p className="mt-8 text-xs tracking-[0.15em] uppercase text-stone">
        Authorized Personnel Only
      </p>
    </AuthSplit>
  );
};

export default AdminSetPassword;
