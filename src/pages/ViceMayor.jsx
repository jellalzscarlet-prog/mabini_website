
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function ViceMayor() {
  const [viceMayor, setViceMayor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchViceMayor() {
      const { data, error } = await supabase
        .from("officials")
        .select("*")
        .eq("group_name", "Municipal Vice Mayor")
        .limit(1)
        .maybeSingle();

      if (error) {
        setError(error.message);
      } else {
        setViceMayor(data);
      }

      setLoading(false);
    }

    fetchViceMayor();
  }, []);

  return (
    <main className="profile-page">
      <Link className="back-button" to="/officials">
        ← Back to Officials
      </Link>

      {loading ? (
        <p>Loading Vice Mayor's profile...</p>
      ) : error ? (
        <p>Unable to load profile: {error}</p>
      ) : !viceMayor ? (
        <p>Vice Mayor's profile is not available yet.</p>
      ) : (
        <div className="profile-container">
          <div className="profile-image">
            <img
              src={viceMayor.image_url || "/images/ViceMayor.jpg"}
              alt={viceMayor.name}
            />
          </div>

          <div className="profile-info">
            <p className="profile-position">
              MUNICIPAL GOVERNMENT OF MABINI
            </p>

            <h1>{viceMayor.name}</h1>
            <p className="profile-position">{viceMayor.position}</p>

            <h2>Biography</h2>
            <p>{viceMayor.biography || "No biography available."}</p>

            <h2>Official Information</h2>
            <div className="profile-details">
              <p>
                <strong>Full Name:</strong> {viceMayor.name}
              </p>
              <p>
                <strong>Position:</strong> {viceMayor.position}
              </p>
              <p>
                <strong>Municipality:</strong> Mabini, Pangasinan
              </p>
              <p>
                <strong>Office:</strong>{" "}
                {viceMayor.organizational_unit || "Office of the Vice Mayor"}
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
