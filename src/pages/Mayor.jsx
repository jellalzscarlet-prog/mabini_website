
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Mayor() {
  const [mayor, setMayor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMayor() {
      const { data, error } = await supabase
        .from("officials")
        .select("*")
        .eq("group_name", "Municipal Mayor")
        .limit(1)
        .maybeSingle();

      if (error) {
        setError(error.message);
      } else {
        setMayor(data);
      }

      setLoading(false);
    }

    fetchMayor();
  }, []);

  return (
    <main className="profile-page">
      <Link className="back-button" to="/officials">
        ← Back to Municipal Officials
      </Link>

      {loading ? (
        <p>Loading Mayor's profile...</p>
      ) : error ? (
        <p>Unable to load profile: {error}</p>
      ) : !mayor ? (
        <p>Mayor's profile is not available yet.</p>
      ) : (
        <div className="profile-container">
          <div className="profile-image">
            <img
              src={mayor.image_url || "/images/Mayor.jpg"}
              alt={mayor.name}
            />
          </div>

          <div className="profile-info">
            <p className="profile-position">
              MUNICIPAL GOVERNMENT OF MABINI
            </p>

            <h1>{mayor.name}</h1>
            <p className="profile-position">{mayor.position}</p>

            <h2>Biography</h2>
            <p>{mayor.biography || "No biography available."}</p>

            <h2>Official Information</h2>
            <div className="profile-details">
              <p>
                <strong>Full Name:</strong> {mayor.name}
              </p>
              <p>
                <strong>Position:</strong> {mayor.position}
              </p>
              <p>
                <strong>Municipality:</strong> Mabini, Pangasinan
              </p>
              <p>
                <strong>Office:</strong> {mayor.organizational_unit || "Office of the Mayor"}
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
