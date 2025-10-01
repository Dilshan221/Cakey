// src/components/delivery/CustomOrderDash.jsx
import React, { useEffect, useState, useCallback } from "react";
import { apiService } from "../../services/api";

const STATUSES = ["Preparing", "Out for Delivery", "Delivered"];

const CustomerOrdersDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  // --- Helpers -------------------------------------------------------------
  const summarizeItem = (rawItem, fallbackName, fallbackSize) => {
    if (!rawItem || typeof rawItem !== "object") {
      const base = rawItem || fallbackName || "Cake";
      return fallbackSize ? `${base} (${fallbackSize})` : String(base);
    }
    const { name, size, quantity, frosting, messageOnCake } = rawItem;
    const parts = [
      name || fallbackName || "Cake",
      size || fallbackSize ? `(${size || fallbackSize})` : null,
      quantity ? `x${quantity}` : null,
      frosting || null,
      messageOnCake ? `"${messageOnCake}"` : null,
    ].filter(Boolean);
    return parts.join(" ");
  };

  const summarizeCustomer = (rawCustomer, fallbackName) => {
    if (!rawCustomer) return fallbackName || "Customer";
    if (typeof rawCustomer === "string") return rawCustomer;
    if (typeof rawCustomer === "object") {
      // Prefer .name if present, else build something readable
      const { name, phone, address } = rawCustomer;
      if (name) return name;
      const pieces = [phone, address].filter(Boolean);
      return pieces.length ? pieces.join(" · ") : fallbackName || "Customer";
    }
    return String(rawCustomer);
  };

  // --- Data ---------------------------------------------------------------
  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiService.listOrders(); // GET /api/delivery/orders
      const list = Array.isArray(data)
        ? data
        : data?.orders || data?.data || [];

      const transformed = list.map((o) => {
        const itemText = summarizeItem(
          o.item,
          o.cakeName || o.productName || "Cake",
          o.cakeSize || o.size
        );
        const customerText = summarizeCustomer(
          o.customer,
          o.customerName || o.name
        );

        return {
          id: o._id || o.id || o.orderId,
          customer: customerText, // always string
          item: itemText, // always string
          price: Number(o.total ?? o.price ?? 0),
          status: o.status || "Preparing",
          details: o,
        };
      });

      setOrders(transformed);
      setLastUpdated(new Date());
      setError("");
    } catch (err) {
      setError(err.message || "Error connecting to server");
      console.error("Error fetching orders:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await apiService.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      alert(`Order ${orderId} status updated to ${newStatus}`);
    } catch (err) {
      alert(err.message || "Failed to update order status");
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to cancel order ${orderId}?`))
      return;
    try {
      await apiService.deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      alert("Order cancelled successfully");
    } catch (err) {
      alert(err.message || "Failed to cancel order");
    }
  };

  const viewInvoice = (orderId) => {
    alert(`Viewing invoice for order ${orderId}`);
  };

  // Initial + manual refresh
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Auto refresh toggle
  useEffect(() => {
    if (!isAutoRefresh) return;
    const t = setInterval(fetchOrders, 10000);
    return () => clearInterval(t);
  }, [isAutoRefresh, fetchOrders]);

  // Spinner keyframes (mounted once)
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Stats
  const totalOrders = orders.length;
  const preparingCount = orders.filter((o) => o.status === "Preparing").length;
  const outForDeliveryCount = orders.filter(
    (o) => o.status === "Out for Delivery"
  ).length;
  const deliveredCount = orders.filter((o) => o.status === "Delivered").length;

  // ===== Styles (unchanged where possible) =====
  const sidebarStyle = {
    width: "280px",
    background: "linear-gradient(180deg, #2c3e50 0%, #34495e 100%)",
    minHeight: "100vh",
    padding: 0,
    position: "fixed",
    top: 0,
    left: 0,
    color: "white",
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
  const subtitleStyle = { fontSize: "16px", color: "#7f8c8d", margin: 0 };
  const headerControlsStyle = {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  };
  const lastUpdatedStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  };
  const lastUpdatedLabelStyle = {
    fontSize: "12px",
    color: "#95a5a6",
    fontWeight: "500",
  };
  const lastUpdatedTimeStyle = {
    fontSize: "14px",
    color: "#2c3e50",
    fontWeight: "600",
  };
  const buttonBaseStyle = {
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.3s ease",
  };
  const refreshButtonStyle = (loading) => ({
    ...buttonBaseStyle,
    background: "#3498db",
    color: "white",
    opacity: loading ? 0.6 : 1,
    cursor: loading ? "not-allowed" : "pointer",
  });
  const toggleButtonStyle = {
    ...buttonBaseStyle,
    background: "#ecf0f1",
    color: "#2c3e50",
  };
  const buttonIconStyle = { fontSize: "14px" };
  const errorStyle = {
    background: "#ffeaea",
    color: "#d63031",
    padding: "15px 20px",
    borderRadius: "8px",
    marginBottom: "25px",
    border: "1px solid #ffcccc",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  };
  const errorIconStyle = { fontSize: "16px" };
  const loadingStyle = {
    textAlign: "center",
    padding: "60px 20px",
    color: "#7f8c8d",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "15px",
  };
  const spinnerStyle = {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #3498db",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  };
  const statsContainerStyle = {
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
    transition: "transform 0.2s ease",
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
  const tableRowStyle = {
    borderBottom: "1px solid #f1f3f4",
    transition: "background 0.2s ease",
  };
  const tableCellStyle = { padding: "16px", fontSize: "14px" };
  const orderIdStyle = {
    fontFamily: "'Monaco', 'Consolas', monospace",
    fontSize: "12px",
    color: "#7f8c8d",
    fontWeight: "500",
  };
  const customerCellStyle = { display: "flex", alignItems: "center" };
  const customerNameStyle = { fontWeight: "500", color: "#2c3e50" };
  const itemStyle = { color: "#34495e" };
  const priceStyle = { fontWeight: "600", color: "#27ae60" };
  const statusSelectStyle = (status) => ({
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "13px",
    fontWeight: "500",
    background: "white",
    color:
      status === "Preparing"
        ? "#FFA726"
        : status === "Out for Delivery"
        ? "#42A5F5"
        : status === "Delivered"
        ? "#66BB6A"
        : "#7f8c8d",
    cursor: "pointer",
    minWidth: "140px",
  });
  const actionButtonsStyle = { display: "flex", gap: "8px" };
  const invoiceButtonStyle = {
    padding: "6px 12px",
    background: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
    transition: "background 0.2s ease",
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
    transition: "background 0.2s ease",
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
  const emptyStateButtonStyle = {
    padding: "12px 24px",
    background: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background 0.2s ease",
  };

  // --- UI -----------------------------------------------------------------
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* SIDEBAR */}
      <aside style={sidebarStyle}>
        <div style={logoContainerStyle}>
          <h2 style={logoStyle}>Cake & Bake</h2>
          <div style={logoSubtitleStyle}>Admin Dashboard</div>
        </div>
        <nav style={navStyle}>
          {/* Use buttons to avoid a11y warnings for # links */}
          <button type="button" style={activeNavItemStyle}>
            <span style={navIconStyle}>📊</span>Orders Dashboard
          </button>
          <button type="button" style={navItemStyle}>
            <span style={navIconStyle}>🍰</span>Default Orders
          </button>
          <button type="button" style={navItemStyle}>
            <span style={navIconStyle}>🎨</span>Custom Orders
          </button>
          <button type="button" style={navItemStyle}>
            <span style={navIconStyle}>⚙️</span>Settings
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main style={mainContentStyle}>
        {/* HEADER */}
        <header style={headerStyle}>
          <div>
            <h1 style={titleStyle}>Customer Orders</h1>
            <p style={subtitleStyle}>
              Manage and track customer orders in real-time
            </p>
          </div>
          <div style={headerControlsStyle}>
            <div style={lastUpdatedStyle}>
              <span style={lastUpdatedLabelStyle}>Last updated:</span>
              <span style={lastUpdatedTimeStyle}>
                {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
            <button
              onClick={fetchOrders}
              disabled={isLoading}
              style={refreshButtonStyle(isLoading)}
            >
              <span style={buttonIconStyle}>↻</span>
              {isLoading ? "Refreshing..." : "Refresh Data"}
            </button>
            <button
              type="button"
              onClick={() => setIsAutoRefresh((v) => !v)}
              style={toggleButtonStyle}
              aria-pressed={isAutoRefresh}
              title="Toggle auto refresh"
            >
              {isAutoRefresh ? "⏸️ Auto-refresh ON" : "▶️ Auto-refresh OFF"}
            </button>
          </div>
        </header>

        {/* ERROR */}
        {error && (
          <div style={errorStyle}>
            <span style={errorIconStyle}>⚠️</span>
            {error}
          </div>
        )}

        {/* LOADING */}
        {isLoading && (
          <div style={loadingStyle}>
            <div style={spinnerStyle}></div>
            <p>Loading orders...</p>
          </div>
        )}

        {/* STATS */}
        {!isLoading && (
          <div style={statsContainerStyle}>
            <div style={statCardStyle}>
              <div style={statNumberStyle}>{totalOrders}</div>
              <div style={statLabelStyle}>Total Orders</div>
            </div>
            <div style={statCardStyle}>
              <div style={{ ...statNumberStyle, color: "#FFA726" }}>
                {preparingCount}
              </div>
              <div style={statLabelStyle}>Preparing</div>
            </div>
            <div style={statCardStyle}>
              <div style={{ ...statNumberStyle, color: "#42A5F5" }}>
                {outForDeliveryCount}
              </div>
              <div style={statLabelStyle}>Out for Delivery</div>
            </div>
            <div style={statCardStyle}>
              <div style={{ ...statNumberStyle, color: "#66BB6A" }}>
                {deliveredCount}
              </div>
              <div style={statLabelStyle}>Delivered</div>
            </div>
          </div>
        )}

        {/* TABLE */}
        {!isLoading && orders.length > 0 && (
          <div style={tableContainerStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>Order ID</th>
                  <th style={tableHeaderStyle}>Customer</th>
                  <th style={tableHeaderStyle}>Item</th>
                  <th style={tableHeaderStyle}>Total Price</th>
                  <th style={tableHeaderStyle}>Status</th>
                  <th style={tableHeaderStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} style={tableRowStyle}>
                    <td style={tableCellStyle}>
                      <span style={orderIdStyle}>
                        #{String(o.id).slice(-8)}
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      <div style={customerCellStyle}>
                        <span style={customerNameStyle}>{o.customer}</span>
                      </div>
                    </td>
                    <td style={tableCellStyle}>
                      <span style={itemStyle}>{o.item}</span>
                    </td>
                    <td style={tableCellStyle}>
                      <span style={priceStyle}>
                        ${Number(o.price || 0).toFixed(2)}
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      <select
                        value={o.status}
                        onChange={(e) =>
                          updateOrderStatus(o.id, e.target.value)
                        }
                        style={statusSelectStyle(o.status)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={tableCellStyle}>
                      <div style={actionButtonsStyle}>
                        <button
                          onClick={() => viewInvoice(o.id)}
                          style={invoiceButtonStyle}
                        >
                          📄 Invoice
                        </button>
                        <button
                          onClick={() => cancelOrder(o.id)}
                          style={cancelButtonStyle}
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* EMPTY */}
        {!isLoading && orders.length === 0 && !error && (
          <div style={emptyStateStyle}>
            <div style={emptyStateIconStyle}>🍰</div>
            <h3 style={emptyStateTitleStyle}>No Orders Found</h3>
            <p style={emptyStateTextStyle}>
              Orders will appear here once customers place them.
            </p>
            <button onClick={fetchOrders} style={emptyStateButtonStyle}>
              Check for New Orders
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerOrdersDashboard;
