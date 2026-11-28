
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin");
  };

  return (
    <main className="admin-dashboard">
      <header className="admin-header">
        <div className="cms-brand">
          <img
            src="/images/mabini-seal.jpg"
            alt="Municipality of Mabini Seal"
          />

          <div>
            <h1>Mabini CMS</h1>
            <p>Municipal Website Management System</p>
          </div>
        </div>

        <button onClick={handleLogout}>Logout</button>
      </header>

      <section className="admin-content">
        <h2>Welcome, Administrator!</h2>
        <p>Manage your municipal website content here.</p>

        <div className="admin-grid">
          <Link to="/admin/news" className="admin-card">
            <h3>News & Events</h3>
            <p>Manage homepage news and carousel slides.</p>
          </Link>

          <Link to="/admin/officials" className="admin-card">
            <h3>Municipal Officials</h3>
            <p>Manage Mayor, Vice Mayor and other officials.</p>
          </Link>

          <Link to="/admin/procurement" className="admin-card">
            <h3>Procurement & Bids</h3>
            <p>Manage procurement plans and bidding records.</p>
          </Link>
        </div>
      </section>
    </main>
  );
}
