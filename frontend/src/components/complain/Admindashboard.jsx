import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Inline styles (mirrors the provided HTML)
  const sx = {
    container: {
      display: "flex",
      margin: 0,
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      background: "#fdfdfd",
      color: "#333",
    },
    sidebar: {
      width: 250,
      background: "#ffe9dc",
      minHeight: "100vh",
      padding: 20,
      boxSizing: "border-box",
      position: "fixed",
      top: 0,
      left: 0,
    },
    logoWrap: { textAlign: "center", marginBottom: 30 },
    logoH2: {
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      color: "#e74c3c",
      margin: 0,
      fontWeight: "600",
      letterSpacing: "-0.5px",
    },
    navLink: {
      display: "block",
      textDecoration: "none",
      padding: "12px 10px",
      color: "#333",
      margin: "5px 0",
      borderRadius: 6,
      transition: ".3s",
      fontWeight: 500,
    },
    navLinkActive: { background: "#ff6f61", color: "#fff" },
    main: { marginLeft: 250, padding: 30, width: "100%" },
    mainH1: { fontSize: 28, marginBottom: 20, color: "#e74c3c" },
    section: { marginBottom: 40 },
    sectionHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    stats: { display: "flex", gap: 20, marginBottom: 25, flexWrap: "wrap" },
    statCard: {
      background: "#fff",
      padding: 20,
      borderRadius: 12,
      boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
      flex: 1,
      minWidth: 180,
      textAlign: "center",
    },
    statH2: { fontSize: 32, color: "#ff6f61", margin: 0 },
    statP: { fontSize: 16, color: "#555", margin: "5px 0 0" },
    tableWrap: { overflowX: "auto" },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      background: "#fff",
      borderRadius: 10,
      overflow: "hidden",
      boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
    },
    thead: { background: "#ff6f61", color: "#fff" },
    thtd: {
      padding: "14px 16px",
      textAlign: "center",
      borderBottom: "1px solid #eee",
    },
    select: {
      padding: 6,
      borderRadius: 6,
      border: "1px solid #ccc",
      fontSize: 14,
    },
    btn: {
      padding: "8px 14px",
      fontSize: 14,
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
      color: "#fff",
      transition: ".3s",
      background: "#27ae60",
    },
    error: {
      background: "#fdecea",
      color: "#c0392b",
      border: "1px solid #fadbd8",
      padding: "10px 12px",
      borderRadius: 8,
      marginBottom: 16,
    },
    textLeft: { textAlign: "left" },
  };

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      // Simulate loading time
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLoading(false);
    } catch (e) {
      setError(e.message || "Failed to load dashboard");
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <div style={sx.container}>
      {/* Sidebar */}
      <aside style={sx.sidebar}>
        <div style={sx.logoWrap}>
          <h2 style={sx.logoH2}>Cake & Bake</h2>
        </div>
        <nav>
          <Link to="/cadmin" style={{ ...sx.navLink, ...sx.navLinkActive }}>
            Dashboard
          </Link>
          <Link to="/reviews" style={sx.navLink}>
            Reviews
          </Link>
          <Link to="/complaintadmin" style={sx.navLink}>
            Complaints
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div style={sx.main}>
        <h1 style={sx.mainH1}>Admin Dashboard</h1>

        {error && <div style={sx.error}>{error}</div>}
        {loading && <div>Loading...</div>}

        {!loading && (
          <div>
            <div style={sx.stats}>
              <div style={sx.statCard}>
                <h2 style={sx.statH2}>Welcome</h2>
                <p style={sx.statP}>Admin Dashboard</p>
              </div>
              <div style={sx.statCard}>
                <h2 style={sx.statH2}>📊</h2>
                <p style={sx.statP}>View Analytics</p>
              </div>
              <div style={sx.statCard}>
                <h2 style={sx.statH2}>⚙️</h2>
                <p style={sx.statP}>Manage System</p>
              </div>
            </div>

            <section style={sx.section}>
              <h2>Quick Actions</h2>
              <p>Use the navigation menu to access different sections:</p>
              <ul>
                <li>
                  <strong>Reviews:</strong> Manage customer reviews and feedback
                </li>
                <li>
                  <strong>Complaints:</strong> Handle customer complaints and
                  support tickets
                </li>
              </ul>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
