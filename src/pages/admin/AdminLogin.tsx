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
      </AuthCard>
      <p className="mt-8 text-xs tracking-[0.15em] uppercase text-stone">
          Authorized Personnel Only
        </p>
    </AuthSplit>
  );
};

export default AdminLogin;