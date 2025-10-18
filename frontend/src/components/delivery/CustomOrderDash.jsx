import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../assets/PDFHeader.png";


export default function CustomOrdersDashboard()
{
  const [hoveredRow, setHoveredRow] = useState(null);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
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
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  // Fetch orders and stats from backend
  useEffect(() =>
  {
    fetch("http://localhost:8000/api/custom-orders")
      .then((res) => res.json())
      .then((data) =>
      {
        const orderArray = Array.isArray(data.data) ? data.data : [];
        setOrders(orderArray);
        setFilteredOrders(orderArray);
      })
      .catch((err) => console.error("Error fetching orders:", err));

    fetchStats();
  }, []);

  useEffect(() =>
  {
    applyFilters();
  }, [filters, orders]);

  function fetchStats()
  {
    fetch("http://localhost:8000/api/custom-orders/dashboard/stats")
      .then((res) => res.json())
      .then((data) =>
      {
        if (data.success)
        {
          const statsArray = data.data;
          const statsObj = {
            total: statsArray.reduce((sum, s) => sum + s.count, 0),
            pending: statsArray.find((s) => s.status === "pending")?.count || 0,
            accepted:
              statsArray.find((s) => s.status === "accepted")?.count || 0,
            rejected:
              statsArray.find((s) => s.status === "rejected")?.count || 0,
          };
          setStats(statsObj);
        }
      })
      .catch((err) => console.error("Error fetching stats:", err));
  }
  function applyFilters()
  {
    let filtered = [...orders];

    if (filters.status !== "all")
    {
      filtered = filtered.filter((order) => order.status === filters.status);
    }

    if (filters.date)
    {
      filtered = filtered.filter((order) => order.date === filters.date);
    }

    if (filters.search)
    {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.customer.toLowerCase().includes(searchTerm) ||
          order.id.toString().includes(searchTerm) ||
          order.item.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredOrders(filtered);
  }

  // Cancel order (DELETE request)
  function cancelOrder(orderId)
  {
    if (window.confirm("Are you sure you want to cancel this order?"))
    {
      fetch(`http://localhost:8000/api/custom-orders/${orderId}`, {
        method: "DELETE",
      })
        .then((res) =>
        {
          if (!res.ok) throw new Error("Failed to cancel order");
          setOrders((prev) => prev.filter((o) => o.id !== orderId));
          fetchStats();
          alert("Order cancelled successfully.");
        })
        .catch((err) => console.error(err));
    }
  }

  // Update order status (PATCH request)
  function handleStatusChange(orderId, newStatus)
  {
    fetch(`http://localhost:8000/api/custom-orders/status/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }), // ✅ send correctly
    })
      .then((res) => res.json())
      .then((data) =>
      {
        console.log("Status updated:", data);
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
        setFilteredOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
      })
      .catch((err) => console.error("Error updating status:", err));
  }

  function cancelOrder(orderId)
  {
    if (window.confirm("Are you sure you want to cancel this order?"))
    {
      fetch(`http://localhost:8000/api/custom-orders/cancel/${orderId}`, {
        method: "DELETE",
      })
        .then((res) => res.json())
        .then((data) =>
        {
          if (data.success)
          {
            setOrders((prev) => prev.filter((o) => o._id !== orderId));
            setFilteredOrders((prev) => prev.filter((o) => o._id !== orderId));
            alert("Order cancelled successfully.");
          } else
          {
            alert(data.message);
          }
        })
        .catch((err) => console.error("Cancel error:", err));
    }
  }

  function handleFilterChange(filterType, value)
  {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  }

  //  VIEW INVOICE
  const viewInvoice = async (orderId) =>
  {
    if (!orderId)
    {
      alert("Order ID is missing!");
      return;
    }

    try
    {
      setLoadingInvoice(true);
      const response = await fetch(`http://localhost:8000/api/custom-orders/${orderId}`);
      const data = await response.json();

      if (data.success && data.data)
      { // backend sends `data`, not `order`
        setSelectedOrder(data.data);
        setShowInvoiceModal(true);
      } else
      {
        alert("Failed to fetch order details");
      }
    } catch (error)
    {
      console.error("Error fetching order details:", error);
      alert("Error fetching order details from server");
    } finally
    {
      setLoadingInvoice(false);
    }
  };

  const exportPDF = () =>
  {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Add header image
    const img = new Image();
    img.src = logo; // Use the imported image
    img.onload = () =>
    {
      const imgWidth = 40; // Width in mm
      const imgHeight = (img.height / img.width) * imgWidth;
      pdf.addImage(img, "PNG", 10, 10, imgWidth, imgHeight);

      // Title and date
      pdf.setFontSize(18);
      pdf.text("Custom Orders Report", pageWidth / 2, 20, {
        align: "center",
      });

      pdf.setFontSize(11);
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, {
        align: "center",
      });

      // Table
      autoTable(pdf, {
        startY: 35 + imgHeight, // Push table below image
        head: [["Order ID", "Customer", "Item", "Contact", "Status"]],
        body: orders.map((order) => [
          order.orderId, // Use custom orderId
          order.customerName,
          order.flavor,
          order.contactNumber, // Use price/total field
          order.status,
        ]),
        theme: "grid",
        headStyles: { fillColor: [231, 76, 60], textColor: 255 },
        styles: { fontSize: 10 },
      });
      pdf.save(`CustomerOrders_${Date.now()}.pdf`);
    };

    img.onerror = () =>
    {
      console.error("Failed to load image");
    };
  };

  // ======== STYLES ========
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

  const headerControlsStyle = {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  };
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
    transition: "border 0.3s ease",
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
    transition: "transform 0.2s ease",
  };

  const statNumberStyle = {
    fontSize: "36px",
    fontWeight: "700",
    color: "#e74c3c",
    margin: "0 0 5px 0",
  };

  const modalContentStyle = {
    background: "white",
    padding: "20px 20px",
    borderRadius: "12px",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "80vh",    // reduced height
    overflowY: "auto",    // scrollable
    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
  };

  const invoiceSectionStyle = {
    marginBottom: "15px",
    paddingBottom: "10px",
    borderBottom: "1px solid #ddd",
  };

  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };

  const emptyStateButtonStyle = {
    padding: "10px 20px",
    background: "#3498db",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background 0.2s ease",
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
  {
    switch (status)
    {
      case "pending":
        return "#FFA726";
      case "accepted":
        return "#66BB6A";
      case "rejected":
        return "#EF5350";
      default:
        return "#7f8c8d";
    }
  };

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
    transition: "all 0.2s ease",
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
    transition: "all 0.2s ease",
  };

  const rowHoverStyle = {
    backgroundColor: "#f8fafc",
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
  const refreshButtonStyle = (isLoading) => ({
    ...buttonBaseStyle,
    background: "#3498db",
    color: "white",
    opacity: isLoading ? 0.6 : 1,
    cursor: isLoading ? "not-allowed" : "pointer",
  });

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

  return (
    <div style={mainStyle}>
      {/* SIDEBAR */}
      <aside style={sidebarStyle}>
        <div style={logoContainerStyle}>
          <h2 style={logoStyle}>Cake & Bake</h2>
          <div style={logoSubtitleStyle}>Admin Dashboard</div>
        </div>
        <nav style={navStyle}>
          <a href="http://localhost:3000/" style={navItemStyle}>
            <span style={navIconStyle}></span>
            Home
          </a>
          <a href="http://localhost:3000/normal-order-dash" style={navItemStyle}>
            <span style={navIconStyle}></span>
            Default Orders
          </a>
          <a
            href="http://localhost:3000/custom-order-dash"
            style={navItemStyle}
          >
            <span style={navIconStyle}></span>
            Custom Orders
          </a>
          <a
            href="http://localhost:3000/ordercomplaint"
            style={navItemStyle}
          >
            <span style={navIconStyle}></span>
            Complaint
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
          <button onClick={exportPDF} style={refreshButtonStyle(false)}>
            📄 Export PDF
          </button>
        </header>

        {/* FILTERS */}
        <div style={filtersStyle}>
          <div style={filterGroupStyle}>
            <label htmlFor="statusFilter" style={filterLabelStyle}>
              Status:
            </label>
            <select
              value={orders.status}
              onChange={(e) => handleStatusChange(orders._id, e.target.value)}
              style={statusSelectStyle(orders.status)}
            >
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
              placeholder="Customer name or ID"
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
          <div style={{ ...statCardStyle }}>
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
                  "Contact",
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
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    data-id={order._id}
                    style={hoveredRow === order._id ? rowHoverStyle : {}}
                    onMouseEnter={() => setHoveredRow(order._id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td style={tableCellStyle}>{order.orderId}</td>
                    <td style={tableCellStyle}>{order.customerName}</td>
                    <td style={tableCellStyle}>{order.flavor}</td>
                    <td style={tableCellStyle}>{order.contactNumber}</td>
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
                        onClick={() => viewInvoice(order._id)}
                        style={invoiceButtonStyle}
                        disabled={loadingInvoice}
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
        {showInvoiceModal && selectedOrder && (
          <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
              <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Invoice</h2>

              {/* Order Information */}
              <section style={invoiceSectionStyle}>
                <h3>Order Information</h3>
                <p><strong>Order ID:</strong> {selectedOrder.orderId || "-"}</p>
                <p><strong>Order Date:</strong> {selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleDateString() : "-"}</p>
                <p><strong>Release Date:</strong> {selectedOrder.releaseDate ? new Date(selectedOrder.releaseDate).toLocaleDateString() : "-"}</p>
                <p><strong>Delivery Method:</strong> {selectedOrder.deliveryMethod || "-"}</p>
                <p><strong>Time:</strong> {selectedOrder.time || "-"}</p>
              </section>

              {/* Customer Information */}
              <section style={invoiceSectionStyle}>
                <h3>Customer Information</h3>
                <p><strong>Name:</strong> {selectedOrder.customerName || "-"}</p>
                <p><strong>Email:</strong> {selectedOrder.email || "-"}</p>
                <p><strong>Contact Number:</strong> {selectedOrder.contactNumber || "-"}</p>
                {selectedOrder.deliveryMethod === "delivery" && (
                  <p><strong>Address:</strong> {selectedOrder.address || "-"}</p>
                )}
              </section>

              {/* Cake Details */}
              <section style={invoiceSectionStyle}>
                <h3>Cake Details</h3>
                <p><strong>Size:</strong> {selectedOrder.size || "-"}</p>
                <p><strong>Flavor:</strong> {selectedOrder.flavor || "-"}</p>
                {selectedOrder.filling && <p><strong>Filling:</strong> {selectedOrder.filling}</p>}
                {selectedOrder.addons && <p><strong>Add-ons:</strong> {selectedOrder.addons}</p>}
                {selectedOrder.exclusions && <p><strong>Exclusions:</strong> {selectedOrder.exclusions}</p>}
              </section>

              {/* Design/Theme */}
              {(selectedOrder.theme || selectedOrder.colors || selectedOrder.inscription || selectedOrder.designImage) && (
                <section style={invoiceSectionStyle}>
                  <h3>Design & Theme</h3>
                  {selectedOrder.theme && <p><strong>Theme:</strong> {selectedOrder.theme}</p>}
                  {selectedOrder.colors && <p><strong>Colors:</strong> {selectedOrder.colors}</p>}
                  {selectedOrder.inscription && <p><strong>Inscription:</strong> {selectedOrder.inscription}</p>}
                  {selectedOrder.designImage && (
                    <p>
                      <strong>Design Image:</strong><br />
                      <img src={selectedOrder.designImage} alt="Design" style={{ maxWidth: "100%", marginTop: "5px" }} />
                    </p>
                  )}
                </section>
              )}

              {/* Status */}
              <section style={invoiceSectionStyle}>
                <h3>Status</h3>
                <p>{selectedOrder.status || "-"}</p>
              </section>

              {/* Close Button */}
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  style={emptyStateButtonStyle}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>

  );
}
