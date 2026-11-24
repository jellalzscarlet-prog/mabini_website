
import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Sidebar from "./components/Sidebar.jsx";
import Footer from "./components/Footer.jsx";

import Home from "./pages/Home.jsx";
import Mayor from "./pages/Mayor.jsx";
import Officials from "./pages/Officials.jsx";
import Members from "./pages/Members.jsx";
import Procurement from "./pages/Procurement.jsx";

// Additional pages
import ViceMayor from "./pages/ViceMayor.jsx";
import AnnualPlan from "./pages/AnnualPlan.jsx";
import ProcurementAwards from "./pages/ProcurementAwards.jsx";
import PublicDocuments from "./pages/PublicDocuments.jsx";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

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
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <div className={`page-content ${sidebarOpen ? "sidebar-open" : ""}`}>
        <Routes>
          {/* Main Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/officials" element={<Officials />} />
          <Route path="/members" element={<Members />} />

          {/* Municipal Officials */}
          <Route path="/mayor" element={<Mayor />} />
          <Route path="/vice-mayor" element={<ViceMayor />} />

          {/* Procurement Pages */}
          <Route path="/procurement" element={<Procurement />} />
          <Route
            path="/procurement/annual-plan"
            element={<AnnualPlan />}
          />
          <Route
            path="/procurement/awards"
            element={<ProcurementAwards />}
          />
          <Route
            path="/procurement/documents"
            element={<PublicDocuments />}
          />

          {/* Fallback */}
          <Route path="*" element={<Home />} />
        </Routes>

        <Footer />
      </div>
    </>
  );
}
