import NewsCarousel from "../components/NewsCarousel.jsx";

const places = [
  [
    "Balincaguin River",
    "A scenic view of the river and bridge in Mabini.",
    "balincaguin-river.jpg",
  ],
  [
    "Sawang Falls",
    "A beautiful waterfall in the municipality.",
    "sawang falls.jpg",
  ],
  [
    "Mt. Matwiltwil",
    "A scenic mountain view in the municipality.",
    "mt matwiltwil.png",
  ],
  [
    "Tagalog River Rock Formation",
    "A unique geological formation along the river.",
    "tagalog river.png",
  ],
  [
    "Cacupangan Cave System",
    "A network of caves in the municipality.",
    "cacupangan cave.jpg",
  ],
];

const services = [
  [
    "Business Permits",
    "Information about business permit applications and renewals.",
  ],
  [
    "Civil Registry",
    "Information about civil registration services and requirements.",
  ],
  ["Health Services", "Updates about local health programs and services."],
];

const hotlines = [
  ["Mabini Hotline", "0912 410 6665"],
  ["Ambulance", "0912 410 6665", "0921 732 8097"],
  ["Mabini PNP", "0998 967 2979"],
  ["MDRRMC", "0921 732 8097"],
  ["MSWD", "0912 146 5860", "0949 862 4751"],
  ["BFP", "0919 330 4090", "0915 934 8152"],
  ["PANELCO 1", "0910 907 3878"],
  [
    "Philippine Red Cross - ERU",
    "0918 937 6917",
    "0917 779 8402",
    "0998 546 5748",
  ],
];

export default function Home() {
  return (
    <main>
      {/* HOME */}
      <section id="home" className="hero">
        <img src="/images/welcome-mabini.jpg" alt="Welcome to Mabini sign" />
        <div className="hero-shade" />
        <div className="hero-copy">
          <p className="eyebrow">WELCOME TO</p>
          <h2>MABINI, PANGASINAN</h2>
          <p>
            Discover our community, local destinations, and public services.
          </p>
          <a className="button" href="#about">
            Explore Mabini
          </a>
        </div>
      </section>

      {/* ABOUT MABINI */}
      <section id="about" className="section about">
        <div className="about-photo">
          <img
            src="/images/municipal-hall.jpg"
            alt="Mabini Municipal Town Hall"
          />
        </div>
        <div className="about-copy">
          <p className="eyebrow green">GET TO KNOW OUR TOWN</p>
          <h2>About Mabini</h2>
          <p>
            Welcome to the Municipality of Mabini, in the Province of
            Pangasinan. This website is a place to learn about the municipality,
            explore local places, and find information about municipal services
            and community updates.
          </p>
        </div>
      </section>

      {/* NEWS & EVENTS - MOVED ABOVE FEATURED PLACES */}
      <section id="news" className="section pale">
        <div className="section-heading">
          <p className="eyebrow green">FROM OUR COMMUNITY</p>
          <h2>News &amp; Community Events</h2>
        </div>
        <NewsCarousel />
      </section>

      {/* FEATURED PLACES */}
      <section id="places" className="section pale">
        <div className="section-heading">
          <p className="eyebrow green">EXPLORE THE COMMUNITY</p>
          <h2>Featured Places</h2>
        </div>
        <div className="cards">
          {places.map(([title, desc, img]) => (
            <article className="card" key={title}>
              <img src={`/images/${img}`} alt={title} />
              <div className="card-body">
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* MUNICIPAL SERVICES */}
      <section id="services" className="section">
        <div className="section-heading">
          <p className="eyebrow green">PUBLIC INFORMATION</p>
          <h2>Municipal Services</h2>
        </div>
        <div className="service-grid">
          {services.map(([title, desc], i) => (
            <div className="service" key={title}>
              <span>0{i + 1}</span>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
        <p className="note centered">
          Sample service descriptions only. Add verified requirements, office
          details, and official contact information before publishing.
        </p>
      </section>

      {/* CONTACT */}
      <section id="contact" className="section contact">
        <div className="section-heading">
          <p className="eyebrow green">LOCAL GOVERNMENT UNIT OF MABINI</p>
          <h2>Emergency Hotline Numbers</h2>
          <p>
            For emergencies and immediate assistance, contact the following
            offices.
          </p>
        </div>
        <div className="hotline-grid">
          {hotlines.map(([title, ...nums]) => (
            <div className="hotline-card" key={title}>
              <h3>{title}</h3>
              {nums.map((num) => (
                <a key={num} href={`tel:${num.replaceAll(" ", "")}`}>
                  {num}
                </a>
              ))}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
