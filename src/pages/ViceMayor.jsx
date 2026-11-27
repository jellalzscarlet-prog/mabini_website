import { Link } from "react-router-dom";
export default function Mayor() {
  return (
    <main className="profile-page">
      <Link className="back-button" to="/officials">
        ← Back to Municipal Officials
      </Link>
      <div className="profile-container">
        <div className="profile-image">
          <img src="/images/Mayor.jpg" alt="Municipal Mayor" />
        </div>
        <div className="profile-info">
          <p className="profile-position">MUNICIPAL GOVERNMENT OF MABINI</p>
          <h1>Colin Reyes</h1>
          <p className="profile-position">Municipal Mayor</p>
          <h2>Biography</h2>
          <p>
            He oversees local government programs and community activities in
            Mabini, including an educational assistance program (AY 2026–2027
            1st Semester), financial assistance to farmers, local sports events
            (such as an inter-barangay basketball tournament and pickleball),
            Undas public cemetery cleanups, and calamity/weather-related
            suspensions and response updates.
          </p>
          <h2>Official Information</h2>
          <div className="profile-details">
            <p>
              <strong>Full Name:</strong> Renillo Cadiz Malalis
            </p>
            <p>
              <strong>Position:</strong> Municipal Vice Mayor
            </p>
            <p>
              <strong>Municipality:</strong> Mabini, Pangasinan
            </p>
            <p>
              <strong>Office:</strong> Office of the Vice Mayor
            </p>
            <p>
              <strong>Facebook:</strong>{" "}
              <a
                href="https://www.facebook.com/mmgm.mabini"
                target="_blank"
                rel="noreferrer"
              >
                Renillo Cadiz Malalis
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
