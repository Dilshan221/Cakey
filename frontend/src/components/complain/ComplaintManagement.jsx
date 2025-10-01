import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ComplaintsAPI } from "../../services/api"; // adjust path if needed

const STATUS_OPTIONS = ["Pending", "Solved"];
const PRIORITY_OPTIONS = ["Low", "Medium", "High"];

export default function ComplaintManagement() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

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
    main: { 
      flex: 1, 
      padding: 30, 
      overflowY: "auto", 
      maxHeight: "100vh", 
      boxSizing: "border-box" 
    },
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
    tableContainer: {
      background: "#fff",
      borderRadius: 10,
      boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
      overflow: "hidden",
      marginTop: 20,
    },
    tableWrap: {
      overflowX: "auto",
      maxHeight: "500px",
      overflowY: "auto",
    },
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
    deleteBtn: {
      padding: "6px 12px",
      fontSize: 12,
      border: "none",
      borderRadius: 4,
      cursor: "pointer",
      color: "#fff",
      transition: ".3s",
      background: "#e74c3c",
    },
    deleteBtnHover: {
      background: "#c0392b",
    },
    searchContainer: {
      background: "#fff",
      padding: 20,
      borderRadius: 10,
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      marginBottom: 20,
    },
    searchRow: {
      display: "flex",
      gap: 15,
      alignItems: "center",
      flexWrap: "wrap",
      marginBottom: 15,
    },
    searchInput: {
      flex: 1,
      minWidth: 250,
      padding: "10px 15px",
      border: "1px solid #ddd",
      borderRadius: 6,
      fontSize: 14,
      outline: "none",
    },
    filterSelect: {
      padding: "10px 15px",
      border: "1px solid #ddd",
      borderRadius: 6,
      fontSize: 14,
      minWidth: 120,
      outline: "none",
    },
    clearBtn: {
      padding: "10px 15px",
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
      background: "#6c757d",
      color: "#fff",
      fontSize: 14,
    },
    resultsCount: {
      fontSize: 14,
      color: "#666",
      fontStyle: "italic",
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

  // Filter and search logic
  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        complaint.name.toLowerCase().includes(searchLower) ||
        complaint.email.toLowerCase().includes(searchLower) ||
        complaint.complaint.toLowerCase().includes(searchLower) ||
        complaint.phone.includes(searchTerm);
      
      // Status filter
      const matchesStatus = statusFilter === "All" || complaint.status === statusFilter;
      
      // Priority filter
      const matchesPriority = priorityFilter === "All" || complaint.priority === priorityFilter;
      
      // Type filter
      const matchesType = typeFilter === "All" || complaint.complaintType === typeFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesType;
    });
  }, [complaints, searchTerm, statusFilter, priorityFilter, typeFilter]);

  const stats = useMemo(() => {
    const total = filteredComplaints.length;
    const pending = filteredComplaints.filter((c) => c.status === "Pending").length;
    const solved = filteredComplaints.filter((c) => c.status === "Solved").length;
    const high = filteredComplaints.filter((c) => c.priority === "High").length;
    return { total, pending, solved, high };
  }, [filteredComplaints]);

  async function handleStatusChange(id, status) {
    try {
      await ComplaintsAPI.updateStatus(id, status);
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status } : c))
      );
    } catch (e) {
      alert(e.message || "Failed to update complaint status");
    }
  }

  async function handlePriorityChange(id, priority) {
    try {
      const current = complaints.find((c) => c._id === id);
      await ComplaintsAPI.update(id, { ...current, priority });
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, priority } : c))
      );
    } catch (e) {
      alert(e.message || "Failed to update complaint priority");
    }
  }

  async function handleDeleteComplaint(id, complainerName) {
    const confirmed = window.confirm(
      `Are you sure you want to delete the complaint by ${complainerName}? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await ComplaintsAPI.delete(id);
      setComplaints((prev) => prev.filter((c) => c._id !== id));
      alert("Complaint deleted successfully");
    } catch (e) {
      alert(e.message || "Failed to delete complaint");
    }
  }

  function clearFilters() {
    setSearchTerm("");
    setStatusFilter("All");
    setPriorityFilter("All");
    setTypeFilter("All");
  }

  const COMPLAINT_TYPES = ["Product Quality", "Customer Service", "Delivery Issue", "Billing Problem"];

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
        
        {/* Search and Filters */}
        <div style={sx.searchContainer}>
          <div style={sx.searchRow}>
            <input
              type="text"
              placeholder="Search complaints by name, email, phone, or complaint text..."
              style={sx.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button style={sx.btn} onClick={loadAll} disabled={loading}>
              {loading ? "Loading..." : "Reload"}
            </button>
          </div>
          
          <div style={sx.searchRow}>
            <select
              style={sx.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            
            <select
              style={sx.filterSelect}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="All">All Priority</option>
              {PRIORITY_OPTIONS.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
            
            <select
              style={sx.filterSelect}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All Types</option>
              {COMPLAINT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            
            <button style={sx.clearBtn} onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
          
          <div style={sx.resultsCount}>
            Showing {filteredComplaints.length} of {complaints.length} complaints
          </div>
        </div>

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
        <div style={sx.tableContainer}>
          <div style={sx.tableWrap}>
            <table style={sx.table}>
            <thead style={sx.thead}>
              <tr>
                <th style={sx.thtd}>Name</th>
                <th style={sx.thtd}>Email</th>
                <th style={sx.thtd}>Complaint</th>
                <th style={sx.thtd}>Priority</th>
                <th style={sx.thtd}>Status</th>
                <th style={sx.thtd}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(filteredComplaints || []).map((c) => (
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
                  <td style={sx.thtd}>
                    <button
                      style={sx.deleteBtn}
                      onClick={() => handleDeleteComplaint(c._id, c.name)}
                      onMouseEnter={(e) => {
                        e.target.style.background = sx.deleteBtnHover.background;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = sx.deleteBtn.background;
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {(!filteredComplaints || filteredComplaints.length === 0) && !loading && (
                <tr>
                  <td style={sx.thtd} colSpan={6}>
                    No complaints found.
                  </td>
                </tr>
              )}
            </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
