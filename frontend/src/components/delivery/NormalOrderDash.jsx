import React, { useEffect, useState } from "react";
import { apiService } from "../../services/api";

export default function CustomOrdersDashboard() {
  const [hoveredRow, setHoveredRow] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    date: "",
    search: "",
  });

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
  });

  // Normalize backend order -> UI shape
  const normalize = (o) => ({
    _raw: o,
    _id: o._id || o.id,
    orderId: o.orderId || o.id,
    customerName: o.customerName || o.customer || "",
    flavor: o.flavor || o.item || "",
    price: Number(o.price ?? o.total ?? 0),
    status: o.status || "pending",
    releaseDate: o.releaseDate || o.date || "", // for filtering
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await apiService.listCustomOrders(); // GET /api/custom-orders
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];
      const normalized = list.map(normalize);
      setOrders(normalized);
      setFiltered(applyFilters(normalized, filters));
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await apiService.getCustomOrdersStats(); // GET /api/custom-orders/dashboard/stats
      // Expect: [{status: 'pending', count: 2}, ...]
      const arr = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];
      const s = {
        total: arr.reduce((sum, x) => sum + (x.count || 0), 0),
        pending: arr.find((x) => x.status === "pending")?.count || 0,
        accepted: arr.find((x) => x.status === "accepted")?.count || 0,
        rejected: arr.find((x) => x.status === "rejected")?.count || 0,
      };
      setStats(s);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, []);

  useEffect(() => {
    setFiltered(applyFilters(orders, filters));
  }, [filters, orders]);

  const applyFilters = (list, f) => {
    let out = [...list];
    if (f.status !== "all") out = out.filter((o) => o.status === f.status);
    if (f.date)
      out = out.filter((o) => (o.releaseDate || "").slice(0, 10) === f.date);
    if (f.search) {
      const s = f.search.toLowerCase();
      out = out.filter(
        (o) =>
          String(o.orderId || "")
            .toLowerCase()
            .includes(s) ||
          o.customerName.toLowerCase().includes(s) ||
          String(o.flavor || "")
            .toLowerCase()
            .includes(s)
      );
    }
    return out;
  };

  // Cancel order
  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await apiService.cancelCustomOrder(orderId); // DELETE /api/custom-orders/cancel/:id
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
      setFiltered((prev) => prev.filter((o) => o._id !== orderId));
      fetchStats();
      alert("Order cancelled successfully.");
    } catch (err) {
      console.error("Cancel error:", err);
      alert(err.message || "Failed to cancel order");
    }
  };

  // Update order status
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await apiService.updateCustomOrderStatus(orderId, newStatus); // PATCH /status/:id
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      setFiltered((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      fetchStats();
    } catch (err) {
      console.error("Error updating status:", err);
      alert(err.message || "Failed to update status");
    }
  };

  const handleFilterChange = (key, val) =>
    setFilters((p) => ({ ...p, [key]: val }));

  const viewInvoice = (orderId) =>
    alert(`Viewing invoice for order ${orderId}`);

  // ======== STYLES (kept from your version) ========
  const mainStyle = {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: "#f8f9fa",
    overflow: "hidden",
  };
  const sidebarStyle = {
    width: "280px",
    background: "linear-gradient(180deg, #2c3e50 0%, #34495e 100%)",
    height: "100vh",
    padding: "0",
    position: "fixed",
    top: 0,
    left: 0,
    color: "white",
    overflowY: "auto",
  };
  const logoContainerStyle = {
    padding: "30px 25px",
    borderBottom: "1px solid #405365",
  };
  const logoStyle = {
    fontFamily: "'Brush Script MT', cursive",
    fontSize: "32px",
    color: "#e74c3c",
    margin: "0 0 5px 0",
    textAlign: "center",
  };
  const logoSubtitleStyle = {
    fontSize: "12px",
    color: "#bdc3c7",
    textAlign: "center",
    letterSpacing: "1px",
    fontWeight: "300",
  };
  const navStyle = { padding: "20px 0" };
  const navItemBaseStyle = {
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
    padding: "15px 25px",
    margin: "2px 0",
    fontWeight: "400",
    fontSize: "15px",
    transition: "all 0.3s ease",
    borderLeft: "4px solid transparent",
  };
  const activeNavItemStyle = {
    ...navItemBaseStyle,
    background: "rgba(255, 255, 255, 0.1)",
    borderLeft: "4px solid #e74c3c",
    color: "white",
  };
  const navItemStyle = {
    ...navItemBaseStyle,
    color: "#bdc3c7",
    borderLeft: "4px solid transparent",
  };
  const navIconStyle = { marginRight: "12px", fontSize: "16px" };
  const mainContentStyle = {
    marginLeft: "280px",
    padding: "30px 40px",
    width: "calc(100% - 280px)",
    background: "#f8f9fa",
    minHeight: "100vh",
    maxHeight: "100vh",
    overflowY: "auto",
    overflowX: "hidden",
  };
  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "30px",
    flexWrap: "wrap",
    gap: "20px",
  };
  const titleStyle = {
    fontSize: "32px",
    fontWeight: "600",
    color: "#2c3e50",
    margin: "0 0 5px 0",
  };
  const subtitleStyle = { fontSize: "16px", color: "#7f8c8d", margin: "0" };
  const filtersStyle = {
    display: "flex",
    justifyContent: "flex-start",
    gap: "30px",
    padding: "20px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
    marginBottom: "25px",
    flexWrap: "wrap",
  };
  const filterGroupStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    minWidth: "150px",
  };
  const filterLabelStyle = {
    fontSize: "14px",
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: "5px",
  };
  const filterInputStyle = {
    padding: "10px 12px",
    border: "1px solid #e9ecef",
    borderRadius: "8px",
    fontSize: "14px",
    background: "white",
  };
  const statsStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  };
  const statCardStyle = {
    background: "white",
    padding: "25px 20px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
    textAlign: "center",
  };
  const statNumberStyle = {
    fontSize: "36px",
    fontWeight: "700",
    color: "#e74c3c",
    margin: "0 0 5px 0",
  };
  const statLabelStyle = {
    fontSize: "14px",
    color: "#7f8c8d",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };
  const tableContainerStyle = {
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
    overflow: "hidden",
  };
  const tableStyle = { width: "100%", borderCollapse: "collapse" };
  const tableHeaderStyle = {
    padding: "18px 16px",
    textAlign: "left",
    fontWeight: "600",
    fontSize: "14px",
    color: "#2c3e50",
    background: "#f8f9fa",
    borderBottom: "1px solid #e9ecef",
  };
  const tableCellStyle = {
    padding: "16px",
    fontSize: "14px",
    borderBottom: "1px solid #f1f3f4",
  };
  const getStatusColor = (status) =>
    status === "pending"
      ? "#FFA726"
      : status === "accepted"
      ? "#66BB6A"
      : status === "rejected"
      ? "#EF5350"
      : "#7f8c8d";
  const statusSelectStyle = (status) => ({
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "13px",
    fontWeight: "500",
    background: "white",
    color: getStatusColor(status),
    cursor: "pointer",
    minWidth: "140px",
  });
  const invoiceButtonStyle = {
    padding: "6px 12px",
    background: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
  };
  const cancelButtonStyle = {
    padding: "6px 12px",
    background: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
  };
  const emptyStateStyle = {
    textAlign: "center",
    padding: "80px 40px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
  };
  const emptyStateIconStyle = { fontSize: "64px", marginBottom: "20px" };
  const emptyStateTitleStyle = {
    color: "#2c3e50",
    margin: "0 0 10px 0",
    fontSize: "24px",
  };
  const emptyStateTextStyle = {
    color: "#7f8c8d",
    margin: "0 0 25px 0",
    fontSize: "16px",
  };

  return (
    <div style={mainStyle}>
      {/* SIDEBAR */}
      <aside style={sidebarStyle}>
        <div style={logoContainerStyle}>
          <h2 style={logoStyle}>Cake & Bake</h2>
          <div style={logoSubtitleStyle}>Admin Dashboard</div>
        </div>
        <nav style={navStyle}>
          <a href="#" style={navItemStyle}>
            <span style={navIconStyle}>📊</span>
            Orders Dashboard
          </a>
          <a href="#" style={activeNavItemStyle}>
            <span style={navIconStyle}>🎨</span>
            Custom Orders
          </a>
          <a href="#" style={navItemStyle}>
            <span style={navIconStyle}>🍰</span>
            Default Orders
          </a>
          <a href="#" style={navItemStyle}>
            <span style={navIconStyle}>⚙️</span>
            Settings
          </a>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main style={mainContentStyle}>
        {/* HEADER */}
        <header style={headerStyle}>
          <div>
            <h1 style={titleStyle}>Custom Orders Dashboard</h1>
            <p style={subtitleStyle}>Manage and track custom cake orders</p>
          </div>
        </header>

        {/* FILTERS */}
        <div style={filtersStyle}>
          <div style={filterGroupStyle}>
            <label htmlFor="statusFilter" style={filterLabelStyle}>
              Status:
            </label>
            <select
              id="statusFilter"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              style={statusSelectStyle(filters.status)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div style={filterGroupStyle}>
            <label htmlFor="dateFilter" style={filterLabelStyle}>
              Release Date:
            </label>
            <input
              type="date"
              id="dateFilter"
              style={filterInputStyle}
              value={filters.date}
              onChange={(e) => handleFilterChange("date", e.target.value)}
            />
          </div>

          <div style={filterGroupStyle}>
            <label htmlFor="search" style={filterLabelStyle}>
              Search:
            </label>
            <input
              type="text"
              id="search"
              placeholder="Customer, ID, flavor"
              style={filterInputStyle}
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
        </div>

        {/* STATS */}
        <div style={statsStyle}>
          <div style={statCardStyle}>
            <h2 style={{ ...statNumberStyle, color: "#e74c3c" }}>
              {stats.total}
            </h2>
            <p style={statLabelStyle}>Total Orders</p>
          </div>
          <div style={statCardStyle}>
            <h2 style={{ ...statNumberStyle, color: "#FFA726" }}>
              {stats.pending}
            </h2>
            <p style={statLabelStyle}>Pending</p>
          </div>
          <div style={statCardStyle}>
            <h2 style={{ ...statNumberStyle, color: "#66BB6A" }}>
              {stats.accepted}
            </h2>
            <p style={statLabelStyle}>Accepted</p>
          </div>
          <div style={statCardStyle}>
            <h2 style={{ ...statNumberStyle, color: "#EF5350" }}>
              {stats.rejected}
            </h2>
            <p style={statLabelStyle}>Rejected</p>
          </div>
        </div>

        {/* ORDERS TABLE */}
        <div style={tableContainerStyle}>
          <table id="ordersTable" style={tableStyle}>
            <thead>
              <tr>
                {[
                  "Order ID",
                  "Customer",
                  "Item",
                  "Total",
                  "Status",
                  "Actions",
                ].map((th) => (
                  <th key={th} style={tableHeaderStyle}>
                    {th}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{ ...tableCellStyle, textAlign: "center" }}
                  >
                    Loading…
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((order) => (
                  <tr
                    key={order._id}
                    data-id={order._id}
                    style={
                      hoveredRow === order._id
                        ? { backgroundColor: "#f8fafc" }
                        : {}
                    }
                    onMouseEnter={() => setHoveredRow(order._id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td style={tableCellStyle}>{order.orderId}</td>
                    <td style={tableCellStyle}>{order.customerName}</td>
                    <td style={tableCellStyle}>{order.flavor}</td>
                    <td style={tableCellStyle}>
                      ${Number(order.price || 0).toFixed(2)}
                    </td>
                    <td style={tableCellStyle}>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                        style={statusSelectStyle(order.status)}
                      >
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td style={tableCellStyle}>
                      <button
                        style={invoiceButtonStyle}
                        onClick={() => viewInvoice(order._id)}
                      >
                        📄 Invoice
                      </button>
                      <button
                        style={cancelButtonStyle}
                        onClick={() => cancelOrder(order._id)}
                      >
                        ✕ Cancel
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    style={{ ...tableCellStyle, textAlign: "center" }}
                  >
                    <div style={emptyStateStyle}>
                      <div style={emptyStateIconStyle}>🍰</div>
                      <h3 style={emptyStateTitleStyle}>No Orders Found</h3>
                      <p style={emptyStateTextStyle}>
                        {orders.length === 0
                          ? "No orders have been placed yet."
                          : "No orders match your current filters."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
