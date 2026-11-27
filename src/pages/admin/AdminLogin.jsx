
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    const { data, error: adminError } =
      await supabase.rpc("is_admin");

    if (adminError || !data) {
      await supabase.auth.signOut();
      setError("You are not authorized to access the CMS.");
      setLoading(false);
      return;
    }

    navigate("/admin/dashboard");
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-card">
        <h1>Mabini CMS</h1>
        <p>Administrator Login</p>

        <form onSubmit={handleLogin}>
          <label>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          {error && <p className="admin-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}
