import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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
    <main className="min-h-screen bg-background-sand flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-muted-slate mb-4">
            Ocean City Development Group
          </p>
          <h1 className="text-3xl md:text-4xl text-charcoal">Administrator Sign In</h1>
          <div className="mt-6 mx-auto h-px w-12 bg-charcoal/20" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border-subtle rounded p-8 space-y-6"
        >
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-xs tracking-[0.2em] uppercase text-slate"
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
              className="w-full px-4 py-3 bg-background border border-input rounded text-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal transition"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-xs tracking-[0.2em] uppercase text-slate"
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
              className="w-full px-4 py-3 bg-background border border-input rounded text-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal transition"
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
            className="w-full inline-flex items-center justify-center px-8 py-3 text-sm font-medium tracking-wider uppercase bg-charcoal text-white rounded hover:bg-charcoal/90 transition disabled:opacity-60"
          >
            {loading ? "Signing In…" : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs tracking-[0.15em] uppercase text-muted-slate">
          Authorized Personnel Only
        </p>
      </div>
    </main>
  );
};

export default AdminLogin;