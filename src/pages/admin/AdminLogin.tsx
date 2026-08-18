import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AuthSplit from "@/components/brand/AuthSplit";
import AuthCard from "@/components/brand/AuthCard";
import BrandLogo from "@/components/BrandLogo";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already signed in as an admin, skip the form.
  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active || !session) return;
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (active && roles) navigate("/admin", { replace: true });
    })();
    return () => {
      active = false;
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError || !data.session) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    // Verify admin role. Non-admins get filtered out by RLS.
    const { data: roleRow, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.session.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleRow) {
      await supabase.auth.signOut();
      setError("This account is not authorized.");
      setLoading(false);
      return;
    }

    navigate("/admin", { replace: true });
  };

  return (
    <AuthSplit>
      {/* The branded panel is hidden on small screens, so show the mark here. */}
      <div className="md:hidden mb-10">
        <BrandLogo className="h-10 w-auto" />
      </div>
      <AuthCard eyebrow="Administrator" title="Sign in">
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-xs tracking-[0.2em] uppercase text-stone"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-input rounded text-ink focus:outline-none focus:ring-1 focus:ring-ink transition"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-xs tracking-[0.2em] uppercase text-stone"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-input rounded text-ink focus:outline-none focus:ring-1 focus:ring-ink transition"
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
            {loading ? "Signing In…" : "Sign In"}
          </button>
        </form>

        {/* Visual only — no OAuth provider is configured for this project yet. */}
        <div className="mt-8 flex items-center gap-4" aria-hidden="true">
          <div className="h-px flex-1 bg-line" />
          <span className="text-xs tracking-[0.2em] uppercase text-stone">Or</span>
          <div className="h-px flex-1 bg-line" />
        </div>

        <button
          type="button"
          disabled
          aria-disabled="true"
          className="mt-6 w-full inline-flex items-center justify-center gap-3 px-8 py-3 text-sm font-medium tracking-wider border border-line rounded text-stone bg-background opacity-60 cursor-not-allowed"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
            <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1 .7-2.4 1.1-4 1.1-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z" />
            <path fill="#FBBC05" d="M5.4 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.4a12 12 0 0 0 0 10.8l4-3.1z" />
            <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.4 0 3.4 2.6 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8z" />
          </svg>
          Sign in with Google
        </button>
        <p className="mt-3 text-xs text-stone text-center">Coming soon</p>
      </AuthCard>
      <p className="mt-8 text-xs tracking-[0.15em] uppercase text-stone">
          Authorized Personnel Only
        </p>
    </AuthSplit>
  );
};

export default AdminLogin;