import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AuthSplit from "@/components/brand/AuthSplit";
import AuthCard from "@/components/brand/AuthCard";
import BrandLogo from "@/components/BrandLogo";

const inputClass =
  "w-full px-4 py-3 bg-background border border-input rounded text-ink focus:outline-none focus:ring-1 focus:ring-ink transition";
const labelClass = "block text-xs tracking-[0.2em] uppercase text-stone";

const AdminSetPassword = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active && session) setReady(true);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    navigate("/admin", { replace: true });
  };

  return (
    <AuthSplit>
      <div className="md:hidden mb-10">
        <BrandLogo className="h-10 w-auto" />
      </div>
      <AuthCard eyebrow="Administrator" title="Set your password">
        {!ready ? (
          <p className="text-sm text-stone">
            Opening your secure link… If nothing happens in a few seconds, open
            the link in your email again.
          </p>
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
              className="w-full inline-flex items-center justify-center px-8 py-3 text-sm font-medium tracking-wider uppercase bg-ink text-paper rounded hover:bg-ink/90 transition disabled:opacity-60"
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