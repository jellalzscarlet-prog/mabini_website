
const links = [
  ['01', 'Home', 'home'],
  ['02', 'About Mabini', 'about'],
  ['03', 'News & Events', 'news'],
  ['04', 'Featured Places', 'places'],
  ['05', 'Procurement Plan/Awards', 'procurement'],
  ['06', 'Officials', 'officials'],
  ['07', 'Services', 'services'],
  ['08', 'Contact', 'contact']
];

export default function Sidebar({ open, onOpenChange }) {
  const close = () => onOpenChange(false);

  const handleNavigation = (id) => {
    close();

    if (id === 'procurement' || id === 'officials') {
      window.location.href = `/${id}`;
      return;
    }

    if (window.location.pathname !== '/') {
      window.location.href = `/#${id}`;
      return;
    }

    // Wait for the sidebar layout transition
    setTimeout(() => {
      const section = document.getElementById(id);

      if (section) {
        section.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 300);
  };

  return (
    <>
      <button
        className={`index-toggle ${open ? 'sidebar-open' : ''}`}
        onClick={() => onOpenChange(!open)}
        aria-label="Toggle navigation"
        aria-expanded={open}
      >
        ☰
      </button>

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <header className="site-header">
          <img
            src="/images/mabini-seal.jpg"
            alt="Mabini seal"
            className="seal"
          />

          <div>
            <h1>Municipality of Mabini</h1>
            <p>Province of Pangasinan, Philippines</p>
          </div>
        </header>

        <div className="nav-label">INDEX</div>

        <nav className="side-nav">
          {links.map(([number, label, id]) => (
            <button
              key={number}
              type="button"
              onClick={() => handleNavigation(id)}
            >
              <span>{number}</span>
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {open && <div className="sidebar-overlay" onClick={close} />}
    </>
  );
}
