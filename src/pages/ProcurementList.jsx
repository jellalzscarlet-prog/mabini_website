
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function ProcurementList({ category, title }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRecords() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("procurement")
        .select("*")
        .eq("category", category)
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
        setRecords([]);
      } else {
        setRecords(data || []);
      }

      setLoading(false);
    }

    fetchRecords();
  }, [category]);

  return (
    <section className="section">
      <div className="section-heading">
        <p className="eyebrow green">
          TRANSPARENCY &amp; ACCOUNTABILITY
        </p>

        <h2>{title}</h2>

        <p>
          Municipality of Mabini, Pangasinan
        </p>
      </div>

      <div className="service-grid">
        {loading ? (
          <p>Loading records...</p>
        ) : error ? (
          <p>Unable to load records: {error}</p>
        ) : records.length === 0 ? (
          <p>No records available yet.</p>
        ) : (
          records.map((item) => (
            <div className="service" key={item.id}>
              <h3>{item.title}</h3>

              <p>{item.description || "No description available."}</p>

              {item.document_url && (
                <a
                  href={item.document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <strong>View PDF Document →</strong>
                </a>
              )}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: "30px" }}>
        <Link to="/procurement">
          ← Back to Procurement and Bids
        </Link>
      </div>
    </section>
  );
}
