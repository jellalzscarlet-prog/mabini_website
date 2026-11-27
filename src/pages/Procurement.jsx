import { Link } from "react-router-dom";

export default function Procurement() {
  const items = [
    [
      "Procurement Plan",
      "The municipality's procurement plans and planned projects.",
      "/procurement/plan",
    ],
    [
      "Bids",
      "Bidding opportunities, notices, and procurement results.",
      "/procurement/bids",
    ],
  ];

  return (
    <section className="section">
      <div className="section-heading">
        <p className="eyebrow green">TRANSPARENCY &amp; ACCOUNTABILITY</p>

        <h2>Procurement and Bids</h2>

        <p>
          Public procurement plans, bidding information, and awarded projects of
          the Municipality of Mabini.
        </p>
      </div>

      <div className="service-grid">
        {items.map(([title, desc, to], i) => (
          <Link to={to} className="service" key={title}>
            <span>0{i + 1}</span>
            <h3>{title}</h3>
            <p>{desc}</p>
            <strong>View Details →</strong>
          </Link>
        ))}
      </div>
    </section>
  );
}
