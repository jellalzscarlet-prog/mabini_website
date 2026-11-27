import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Sidebar from "./components/Sidebar.jsx";
import Footer from "./components/Footer.jsx";

import Home from "./pages/Home.jsx";
import Mayor from "./pages/Mayor.jsx";
import ViceMayor from "./pages/ViceMayor.jsx";
import Officials from "./pages/Officials.jsx";
import Members from "./pages/Members.jsx";
import Procurement from "./pages/Procurement.jsx";

import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminGuard from "./pages/admin/AdminGuard.jsx";

import ManageNews from "./pages/admin/ManageNews.jsx";
import ManageOfficials from "./pages/admin/ManageOfficials.jsx";

function ComingSoon({ title }) {
  return (
    <main className="admin-dashboard">
      <h1>{title}</h1>
      <p>This management page is not yet available.</p>
      <a href="/admin/dashboard">Back to Dashboard</a>
    </main>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    if (location.pathname === "/" && location.hash) {
      const id = location.hash.replace("#", "");

      setTimeout(() => {
        const section = document.getElementById(id);

        if (section) {
          section.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    } else if (location.pathname !== "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.pathname, location.hash]);

  return (
    <>
      {!isAdminRoute && (
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      )}

      <div
        className={
          !isAdminRoute && sidebarOpen
            ? "page-content sidebar-open"
            : "page-content"
        }
      >
        <Routes>
          {/* Public Website */}
          <Route path="/" element={<Home />} />
          <Route path="/mayor" element={<Mayor />} />
          <Route path="/vice-mayor" element={<ViceMayor />} />
          <Route path="/officials" element={<Officials />} />
          <Route path="/members" element={<Members />} />
          <Route path="/procurement" element={<Procurement />} />

          {/* CMS Login */}
          <Route path="/admin" element={<AdminLogin />} />

          {/* CMS Dashboard */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminGuard>
                <AdminDashboard />
              </AdminGuard>
            }
          />

          {/* CMS Management Pages */}
          <Route
            path="/admin/news"
            element={
              <AdminGuard>
                <ManageNews />
              </AdminGuard>
            }
          />

          <Route
            path="/admin/officials"
            element={
              <AdminGuard>
                <ManageOfficials />
              </AdminGuard>
            }
          />

          <Route
            path="/admin/procurement"
            element={
              <AdminGuard>
                <ComingSoon title="Manage Procurement & Awards" />
              </AdminGuard>
            }
          />

          <Route path="*" element={<Home />} />
        </Routes>

        {!isAdminRoute && <Footer />}
      </div>
    </>
  );
}
