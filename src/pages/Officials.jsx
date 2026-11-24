
import { Link } from "react-router-dom";

const groups = [
  ["Municipal Mayor", "Mayor.jpg", "/mayor"],
  ["Municipal Vice Mayor", "ViceMayor.jpg", "/vice-mayor"],
  [
    "Municipal Employees",
    "mabini-seal.jpg",
    "/members?group=Municipal%20Employees",
  ],
  [
    "Barangay Officials",
    "barangay.png",
    "/members?group=Barangay%20Officials",
  ],
  [
    "SK Officials (Sangguniang Kabataan)",
    "SK.jpg",
    "/members?group=SK%20Officials",
  ],
  [
    "Department of Education (DepEd) Officials",
    "deped.png",
    "/members?group=DepEd%20Officials",
  ],
  [
    "Philippine National Police (PNP) Officials",
    "pnp.png",
    "/members?group=PNP%20Officials",
  ],
  [
    "MFS (Mabini Fire Station) Officials",
    "mbp.png",
    "/members?group=Mabini%20Fire%20Station",
  ],
  [
    "Job Order (JO) Officials",
    "jo.jpg",
    "/members?group=Job%20Order",
  ],
];

export default function Officials() {
  return (
    <section className="section">
      <div className="section-heading">
        <p className="eyebrow green">LOCAL GOVERNMENT</p>
        <h2>Municipal Officials</h2>
        <p>
          Meet the officials serving the Municipality of Mabini, Pangasinan.
        </p>
      </div>

      <div className="cards">
        {groups.map(([title, img, to]) => (
          <Link to={to} className="card member-card" key={title}>
            <img
              className={title.includes("Mayor") ? "" : "logo"}
              src={`/images/${img}`}
              alt={title}
            />

            <div className="card-body">
              <h3>{title}</h3>
              <p>
                {title.includes("Mayor")
                  ? "View official profile →"
                  : "View members →"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
