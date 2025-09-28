import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ReviewsAPI } from "../../services/api"; // adjust path if needed

const STATUS_OPTIONS = ["Pending", "Solved"];

export default function ReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Inline styles
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
    main: {
      marginLeft: 250,
      padding: 30,
      width: "100%",
      overflowY: "auto", // Enable vertical scrolling on main content
      maxHeight: "100vh", // Limit height to viewport height
      boxSizing: "border-box",
    },
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
    tableWrap: {
      overflowX: "auto",
      maxHeight: "600px", // Set max height for vertical scrolling on table
      overflowY: "auto",
      borderRadius: 10,
      boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
      background: "#fff",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      background: "#fff",
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
      fontWeight: "500",
    },
    selectPending: {
      backgroundColor: "#fff3cd",
      color: "#856404",
      border: "1px solid #ffeaa7",
    },
    selectSolved: {
      backgroundColor: "#d4edda",
      color: "#155724",
      border: "1px solid #c3e6cb",
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
      const rev = await ReviewsAPI.list();
      setReviews(rev || []);
    } catch (e) {
      setError(e.message || "Failed to load data");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const reviewStats = useMemo(() => {
    if (!reviews || !Array.isArray(reviews)) {
      return { total: 0, pending: 0, solved: 0 };
    }
    const total = reviews.length;
    const pending = reviews.filter((r) => r.status === "Pending").length;
    const solved = reviews.filter((r) => r.status === "Solved").length;
    return { total, pending, solved };
  }, [reviews]);

  async function handleReviewStatusChange(id, status) {
    try {
      await ReviewsAPI.updateStatus(id, status);
      setReviews((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status } : r))
      );
    } catch (e) {
      alert(e.message || "Failed to update review status");
    }
  }

  return (
    <div style={sx.container}>
      {/* Sidebar */}
      <aside style={sx.sidebar}>
        <div style={sx.logoWrap}>
          <h2 style={sx.logoH2}>Cake & Bake</h2>
        </div>
        <nav>
          <Link to="/cadmin" style={sx.navLink}>
            Dashboard
          </Link>
          <Link to="/reviews" style={{ ...sx.navLink, ...sx.navLinkActive }}>
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

        {/* Reviews Section */}
        <section id="reviews" style={sx.section}>
          <div style={sx.sectionHeader}>
            <h2>Customer Reviews</h2>
            <button style={sx.btn} onClick={loadAll} disabled={loading}>
              Reload
            </button>
          </div>

          {/* Stats */}
          <div style={sx.stats}>
            <div style={sx.statCard}>
              <h2 style={sx.statH2}>{reviewStats.total}</h2>
              <p style={sx.statP}>Total Reviews</p>
            </div>
            <div style={sx.statCard}>
              <h2 style={sx.statH2}>{reviewStats.pending}</h2>
              <p style={sx.statP}>Pending</p>
            </div>
            <div style={sx.statCard}>
              <h2 style={sx.statH2}>{reviewStats.solved}</h2>
              <p style={sx.statP}>Solved</p>
            </div>
          </div>

          {/* Table */}
          <div style={sx.tableWrap}>
            <table style={sx.table}>
              <thead style={sx.thead}>
                <tr>
                  <th style={sx.thtd}>Reviewer</th>
                  <th style={sx.thtd}>Email</th>
                  <th style={sx.thtd}>Product</th>
                  <th style={sx.thtd}>Rating</th>
                  <th style={sx.thtd}>Review</th>
                  <th style={sx.thtd}>Status</th>
                </tr>
              </thead>
              <tbody>
                {(reviews || []).map((r) => (
                  <tr key={r._id}>
                    <td style={sx.thtd}>{r.name}</td>
                    <td style={sx.thtd}>{r.email}</td>
                    <td style={sx.thtd}>{r.product}</td>
                    <td style={sx.thtd}>{r.rating}</td>
                    <td style={{ ...sx.thtd, ...sx.textLeft }}>{r.review}</td>
                    <td style={sx.thtd}>
                      <select
                        style={{
                          ...sx.select,
                          ...(r.status === "Solved"
                            ? sx.selectSolved
                            : sx.selectPending),
                        }}
                        value={r.status || "Pending"}
                        onChange={(e) =>
                          handleReviewStatusChange(r._id, e.target.value)
                        }
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {(!reviews || reviews.length === 0) && !loading && (
                  <tr>
                    <td style={sx.thtd} colSpan={6}>
                      No reviews found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
