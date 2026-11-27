
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function AdminGuard({ children }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;

    async function checkAdmin() {
      const { data: { session } } =
        await supabase.auth.getSession();

      if (!session) {
        if (active) setStatus("unauthorized");
        return;
      }

      const { data, error } =
        await supabase.rpc("is_admin");

      if (active) {
        setStatus(!error && data ? "authorized" : "unauthorized");
      }
    }

    checkAdmin();

    return () => {
      active = false;
    };
  }, []);

  if (status === "loading") {
    return <p>Checking administrator access...</p>;
  }

  if (status !== "authorized") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
