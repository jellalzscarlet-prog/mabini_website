
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
        .order("project_date", { ascending: false });

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

  function formatDate(date) {
    if (!date) return "—";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <section className="section procurement-list-page">
      <div className="section-heading">
        <p className="eyebrow green">
          TRANSPARENCY &amp; ACCOUNTABILITY
        </p>

        <h2>{title}</h2>

        <p>
          Official {title} records of the Municipality of Mabini,
          Pangasinan.
        </p>
      </div>

      <div className="procurement-table-wrapper">
        {loading ? (
          <p>Loading records...</p>
        ) : error ? (
          <p>Unable to load records: {error}</p>
        ) : records.length === 0 ? (
          <p>No records available yet.</p>
        ) : (
          <table className="procurement-table">
            <thead>
              <tr>
                <th>Name of Project</th>
                <th>PDF File</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>{record.title}</td>

                  <td>
                    {record.document_url ? (
                      <a
                        href={record.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="procurement-pdf-link"
                      >
                        View PDF
                      </a>
                    ) : (
                      "No PDF available"
                    )}
                  </td>

                  <td>{formatDate(record.project_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
