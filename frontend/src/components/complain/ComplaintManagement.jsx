import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ComplaintsAPI } from "../../services/api"; // adjust path if needed

const STATUS_OPTIONS = ["Pending", "Solved"];
const PRIORITY_OPTIONS = ["Low", "Medium", "High"];

export default function ComplaintManagement() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sx = {
    container: {
      display: "flex",
      minHeight: "100vh",
      fontFamily: "system-ui",
      background: "#fdfdfd",
    },
    sidebar: { width: 250, background: "#ffe9dc", padding: 20, flexShrink: 0 },
    logoWrap: { textAlign: "center", marginBottom: 30 },
    logoH2: { color: "#e74c3c", margin: 0, fontWeight: "600" },
    navLink: {
      display: "block",
      padding: "12px 10px",
      color: "#333",
      margin: "5px 0",
      borderRadius: 6,
      textDecoration: "none",
      fontWeight: 500,
    },
    navLinkActive: { background: "#ff6f61", color: "#fff" },
    main: { flex: 1, padding: 30, overflowY: "auto" },
    mainH1: { fontSize: 28, marginBottom: 20, color: "#e74c3c" },
    stats: { display: "flex", gap: 20, marginBottom: 25, flexWrap: "wrap" },
    statCard: {
      background: "#fff",
      padding: 20,
      borderRadius: 12,
      boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
      flex: "1 1 180px",
      minWidth: 180,
      textAlign: "center",
    },
    statH2: { fontSize: 32, color: "#ff6f61", margin: 0 },
    statP: { fontSize: 16, color: "#555" },
    tableWrap: { overflowX: "auto", maxHeight: "600px", overflowY: "auto" },
    table: { width: "100%", borderCollapse: "collapse" },
    thead: { background: "#ff6f61", color: "#fff" },
    thtd: {
      padding: "14px 16px",
      textAlign: "center",
      borderBottom: "1px solid #eee",
    },
    complaintCell: {
      padding: "14px 16px",
      textAlign: "left",
      borderBottom: "1px solid #eee",
      maxWidth: "300px",
      wordWrap: "break-word",
    },
    select: {
      padding: 6,
      borderRadius: 6,
      border: "1px solid #ccc",
      fontSize: 14,
      fontWeight: 500,
    },
    selectPending: { backgroundColor: "#fff3cd", color: "#856404" },
    selectSolved: { backgroundColor: "#d4edda", color: "#155724" },
    selectLow: { backgroundColor: "#d1ecf1", color: "#0c5460" },
    selectMedium: { backgroundColor: "#ffeaa7", color: "#6c757d" },
    selectHigh: { backgroundColor: "#f8d7da", color: "#721c24" },
    btn: {
      padding: "8px 14px",
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
      background: "#27ae60",
      color: "#fff",
    },
    error: {
      background: "#fdecea",
      color: "#c0392b",
      padding: 12,
      borderRadius: 8,
    },
  };

  async function loadAll() {
    setLoading(true);
    try {
      const comp = await ComplaintsAPI.list();
      setComplaints(comp || []);
    } catch (e) {
      setError(e.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const stats = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter((c) => c.status === "Pending").length;
    const solved = complaints.filter((c) => c.status === "Solved").length;
    const high = complaints.filter((c) => c.priority === "High").length;
    return { total, pending, solved, high };
  }, [complaints]);

  async function handleStatusChange(id, status) {
    await ComplaintsAPI.updateStatus(id, status);
    setComplaints((prev) =>
      prev.map((c) => (c._id === id ? { ...c, status } : c))
    );
  }

  async function handlePriorityChange(id, priority) {
    await ComplaintsAPI.update(id, { priority });
    setComplaints((prev) =>
      prev.map((c) => (c._id === id ? { ...c, priority } : c))
    );
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
          <Link to="/reviews" style={sx.navLink}>
            Reviews
          </Link>
          <Link to="/complaints" style={{ ...sx.navLink, ...sx.navLinkActive }}>
            Complaints
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <div style={sx.main}>
        <h1 style={sx.mainH1}>Complaint Management</h1>
        {error && <div style={sx.error}>{error}</div>}
        <button style={sx.btn} onClick={loadAll} disabled={loading}>
          {loading ? "Loading..." : "Reload"}
        </button>

        {/* Stats */}
        <div style={sx.stats}>
          <div style={sx.statCard}>
            <h2 style={sx.statH2}>{stats.total}</h2>
            <p style={sx.statP}>Total</p>
          </div>
          <div style={sx.statCard}>
            <h2 style={sx.statH2}>{stats.pending}</h2>
            <p style={sx.statP}>Pending</p>
          </div>
          <div style={sx.statCard}>
            <h2 style={sx.statH2}>{stats.solved}</h2>
            <p style={sx.statP}>Solved</p>
          </div>
          <div style={sx.statCard}>
            <h2 style={sx.statH2}>{stats.high}</h2>
            <p style={sx.statP}>High Priority</p>
          </div>
        </div>

        {/* Table */}
        <div style={sx.tableWrap}>
          <table style={sx.table}>
            <thead style={sx.thead}>
              <tr>
                <th style={sx.thtd}>Name</th>
                <th style={sx.thtd}>Email</th>
                <th style={sx.thtd}>Complaint</th>
                <th style={sx.thtd}>Priority</th>
                <th style={sx.thtd}>Status</th>
              </tr>
            </thead>
            <tbody>
              {(complaints || []).map((c) => (
                <tr key={c._id}>
                  <td style={sx.thtd}>{c.name}</td>
                  <td style={sx.thtd}>{c.email}</td>
                  <td style={sx.complaintCell}>{c.complaint}</td>
                  <td style={sx.thtd}>
                    <select
                      style={{
                        ...sx.select,
                        ...(c.priority === "High"
                          ? sx.selectHigh
                          : c.priority === "Low"
                          ? sx.selectLow
                          : sx.selectMedium),
                      }}
                      value={c.priority || "Medium"}
                      onChange={(e) =>
                        handlePriorityChange(c._id, e.target.value)
                      }
                    >
                      {PRIORITY_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={sx.thtd}>
                    <select
                      style={{
                        ...sx.select,
                        ...(c.status === "Solved"
                          ? sx.selectSolved
                          : sx.selectPending),
                      }}
                      value={c.status || "Pending"}
                      onChange={(e) =>
                        handleStatusChange(c._id, e.target.value)
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
              {(!complaints || complaints.length === 0) && (
                <tr>
                  <td style={sx.thtd} colSpan={5}>
                    No complaints found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
