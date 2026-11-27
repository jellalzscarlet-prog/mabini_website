import { Link } from "react-router-dom";
export default function Mayor() {
  return (
    <main className="profile-page">
      <Link className="back-button" to="/officials">
        ← Back to Municipal Officials
      </Link>
      <div className="profile-container">
        <div className="profile-image">
          <img src="/images/ViceMayor.jpg" alt="Municipal Vice Mayor" />
        </div>
        <div className="profile-info">
          <p className="profile-position">MUNICIPAL GOVERNMENT OF MABINI</p>
          <h1>Renillo Cadiz Malalis</h1>
          <p className="profile-position">Municipal Vice Mayor</p>
          <h2>Biography</h2>
          <p>
            Affectionately known throughout his community as "Pastor" Malalis—is
            a Filipino religious leader and public servant currently serving as
            the Vice Mayor of Mabini, Pangasinan. Grounded in his personal
            philosophy that "serving God is serving people," he bridges pastoral
            ministry and local legislative governance.
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
