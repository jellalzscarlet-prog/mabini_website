import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Members() {
  const [params] = useSearchParams();
  const group = params.get("group") || "Member List";

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchMembers() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("officials")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true });

      if (!active) return;

      if (error) {
        setError(error.message);
        setRows([]);
      } else {
        setRows(data || []);
      }

      setLoading(false);
    }

    fetchMembers();

    return () => {
      active = false;
    };
  }, [group]);

  return (
    <div className="members-page">
      <header className="members-header">
        <Link to="/officials" className="back-button">
          ← Back to Officials
        </Link>

        <h1>{group}</h1>
        <p>Municipality of Mabini, Pangasinan</p>
      </header>

      <main className="members-container">
        <div className="department-header">
          <h2>{group}</h2>
        </div>

        <div className="member-toolbar">
          <h3>Member Records</h3>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Organizational Unit</th>
                <th>Position Title</th>
                <th>Name</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3">Loading members...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="3">Unable to load members: {error}</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan="3">No member records available yet.</td>
                </tr>
              ) : (
                rows.map((member) => (
                  <tr key={member.id}>
                    <td>{member.organizational_unit || "—"}</td>
                    <td>{member.position || "—"}</td>
                    <td>{member.name || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
