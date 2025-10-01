import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ReviewsAPI } from "../../services/api"; // adjust path if needed

const STATUS_OPTIONS = ["Pending", "Solved"];

export default function ReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [productFilter, setProductFilter] = useState("All");

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

  // Filter and search logic
  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        review.name.toLowerCase().includes(searchLower) ||
        review.email.toLowerCase().includes(searchLower) ||
        review.product.toLowerCase().includes(searchLower) ||
        review.review.toLowerCase().includes(searchLower);
      
      // Status filter
      const matchesStatus = statusFilter === "All" || review.status === statusFilter;
      
      // Rating filter
      const matchesRating = ratingFilter === "All" || 
        (ratingFilter === "5" && review.rating === 5) ||
        (ratingFilter === "4+" && review.rating >= 4) ||
        (ratingFilter === "3+" && review.rating >= 3) ||
        (ratingFilter === "2+" && review.rating >= 2) ||
        (ratingFilter === "1+" && review.rating >= 1);
      
      // Product filter
      const matchesProduct = productFilter === "All" || review.product === productFilter;
      
      return matchesSearch && matchesStatus && matchesRating && matchesProduct;
    });
  }, [reviews, searchTerm, statusFilter, ratingFilter, productFilter]);

  // Get unique products for filter dropdown
  const uniqueProducts = useMemo(() => {
    const products = reviews.map(r => r.product).filter(Boolean);
    return [...new Set(products)].sort();
  }, [reviews]);

  const reviewStats = useMemo(() => {
    if (!filteredReviews || !Array.isArray(filteredReviews)) {
      return { total: 0, pending: 0, solved: 0 };
    }
    const total = filteredReviews.length;
    const pending = filteredReviews.filter((r) => r.status === "Pending").length;
    const solved = filteredReviews.filter((r) => r.status === "Solved").length;
    return { total, pending, solved };
  }, [filteredReviews]);

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

  async function handleDeleteReview(id, reviewerName) {
    const confirmed = window.confirm(
      `Are you sure you want to delete the review by ${reviewerName}? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await ReviewsAPI.delete(id);
      setReviews((prev) => prev.filter((r) => r._id !== id));
      alert("Review deleted successfully");
    } catch (e) {
      alert(e.message || "Failed to delete review");
    }
  }

  function clearFilters() {
    setSearchTerm("");
    setStatusFilter("All");
    setRatingFilter("All");
    setProductFilter("All");
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
        
        {/* Search and Filters */}
        <div style={sx.searchContainer}>
          <div style={sx.searchRow}>
            <input
              type="text"
              placeholder="Search reviews by name, email, product, or review text..."
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
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
            >
              <option value="All">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4+">4+ Stars</option>
              <option value="3+">3+ Stars</option>
              <option value="2+">2+ Stars</option>
              <option value="1+">1+ Stars</option>
            </select>
            
            <select
              style={sx.filterSelect}
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
            >
              <option value="All">All Products</option>
              {uniqueProducts.map((product) => (
                <option key={product} value={product}>
                  {product}
                </option>
              ))}
            </select>
            
            <button style={sx.clearBtn} onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
          
          <div style={sx.resultsCount}>
            Showing {filteredReviews.length} of {reviews.length} reviews
          </div>
        </div>

        {/* Reviews Section */}
        <section id="reviews" style={sx.section}>
          <div style={sx.sectionHeader}>
            <h2>Customer Reviews</h2>
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
          <div style={sx.tableContainer}>
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
                  <th style={sx.thtd}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(filteredReviews || []).map((r) => (
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
                    <td style={sx.thtd}>
                      <button
                        style={sx.deleteBtn}
                        onClick={() => handleDeleteReview(r._id, r.name)}
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
                {(!filteredReviews || filteredReviews.length === 0) && !loading && (
                  <tr>
                    <td style={sx.thtd} colSpan={7}>
                      No reviews found.
                    </td>
                  </tr>
                )}
              </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
