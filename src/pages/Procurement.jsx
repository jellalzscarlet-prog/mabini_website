export default function Procurement() {
  const items = [
    [
      "Annual Procurement Plan",
      "View the municipality’s planned procurement activities and projects.",
    ],
    [
      "Procurement Awards",
      "Information about awarded contracts and procurement activities.",
    ],
    [
      "Public Documents",
      "Access procurement-related documents and public records.",
    ],
  ];
  return (
    <section className="section">
      <div className="section-heading">
        <p className="eyebrow green">TRANSPARENCY &amp; ACCOUNTABILITY</p>
        <h2>Procurement Plan / Awards</h2>
        <p>
          Public procurement information, plans, notices, and awarded projects
          of the Municipality of Mabini.
        </p>
      </div>
      <div className="service-grid">
        {items.map(([title, desc], i) => (
          <div className="service" key={title}>
            <span>0{i + 1}</span>
            <h3>{title}</h3>
            <p>{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
