import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../assets/PDFHeader.png";

const CustomerOrdersDashboard = () =>
{
  //  STATE VARIABLES
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  // FETCH ORDERS FUNCTION
  const fetchOrders = async () =>
  {
    try
    {
      setIsLoading(true);
      const response = await fetch("http://localhost:8000/orders");
      const data = await response.json();

      if (data.success)
      {
        const transformedOrders = data.orders.map((order) => ({
          id: order._id,
          customer: order.customerName,
          item: `${order.cakeName} (${order.cakeSize})`,
          price: order.total,
          status: order.status || "Preparing",
          details: order,
        }));

        setOrders(transformedOrders);
        setLastUpdated(new Date());
        setError("");
      } else
      {
        setError("Failed to fetch orders");
      }
    } catch (error)
    {
      setError("Error connecting to server");
      console.error("Error fetching orders:", error);
    } finally
    {
      setIsLoading(false);
    }
  };

  //  UPDATE ORDER STATUS
  const updateOrderStatus = async (orderId, newStatus) =>
  {
    try
    {
      const response = await fetch(
        `http://localhost:8000/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (data.success)
      {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
        alert(`Order ${orderId} status updated to ${newStatus}`);
      } else
      {
        alert("Failed to update order status");
      }
    } catch (error)
    {
      alert("Error updating order status");
      console.error("Error updating status:", error);
    }
  };

  //  CANCEL ORDER
  const cancelOrder = async (orderId) =>
  {
    if (!window.confirm(`Are you sure you want to cancel order ${orderId}?`))
    {
      return;
    }

    try
    {
      const response = await fetch(`http://localhost:8000/orders/${orderId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success)
      {
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order.id !== orderId)
        );
        alert("Order cancelled successfully");
      } else
      {
        alert("Failed to cancel order");
      }
    } catch (error)
    {
      alert("Error cancelling order");
      console.error("Error cancelling order:", error);
    }
  };

  //  VIEW INVOICE
  const viewInvoice = async (orderId) =>
  {
    try
    {
      setLoadingInvoice(true);
      const response = await fetch(`http://localhost:8000/orders/${orderId}`);
      const data = await response.json();

      if (data.success && data.order)
      {
        setSelectedOrder(data.order);
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


  //  LOAD DATA WHEN COMPONENT STARTS
  useEffect(() =>
  {
    fetchOrders();

    let refreshTimer;
    if (isAutoRefresh)
    {
      refreshTimer = setInterval(fetchOrders, 10000);
    }

    return () =>
    {
      if (refreshTimer)
      {
        clearInterval(refreshTimer);
      }
    };
  }, [isAutoRefresh]);

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
      pdf.text("Customer Orders Report", pageWidth / 2, 20, {
        align: "center",
      });

      pdf.setFontSize(11);
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, {
        align: "center",
      });

      // Table
      autoTable(pdf, {
        startY: 35 + imgHeight, // Push table below image
        head: [["Order ID", "Customer", "Item", "Price", "Status"]],
        body: orders.map((order) => [
          order.id.slice(-8),
          order.customer,
          order.item,
          `$${order.price.toFixed(2)}`,
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

  //  CALCULATE STATISTICS
  const totalOrders = orders.length;
  const preparingCount = orders.filter(
    (order) => order.status === "Preparing"
  ).length;
  const outForDeliveryCount = orders.filter(
    (order) => order.status === "Out for Delivery"
  ).length;
  const deliveredCount = orders.filter(
    (order) => order.status === "Delivered"
  ).length;

  //  RENDER THE UI
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
            <button onClick={exportPDF} style={refreshButtonStyle(false)}>
              📄 Export PDF
            </button>
          </div>
        </header>

        {/* ERROR MESSAGE */}
        {error && (
          <div style={errorStyle}>
            <span style={errorIconStyle}></span>
            {error}
          </div>
        )}

        {/* LOADING STATE */}
        {isLoading && (
          <div style={loadingStyle}>
            <div style={spinnerStyle}></div>
            <p>Loading orders...</p>
          </div>
        )}

        {/* STATISTICS CARDS */}
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

        {/* ORDERS TABLE */}
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
                {orders.map((order) => (
                  <tr key={order.id} style={tableRowStyle}>
                    <td style={tableCellStyle}>
                      <span style={orderIdStyle}>#{order.id.slice(-8)}</span>
                    </td>
                    <td style={tableCellStyle}>
                      <div style={customerCellStyle}>
                        <span style={customerNameStyle}>{order.customer}</span>
                      </div>
                    </td>
                    <td style={tableCellStyle}>
                      <span style={itemStyle}>{order.item}</span>
                    </td>
                    <td style={tableCellStyle}>
                      <span style={priceStyle}>${order.price.toFixed(2)}</span>
                    </td>
                    <td style={tableCellStyle}>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(order.id, e.target.value)
                        }
                        style={statusSelectStyle(order.status)}
                      >
                        <option value="Preparing">Preparing</option>
                        <option value="Out for Delivery">
                          Out for Delivery
                        </option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                    <td style={tableCellStyle}>
                      <div style={actionButtonsStyle}>
                        <button
                          onClick={() => viewInvoice(order.id)}
                          style={invoiceButtonStyle}
                          disabled={loadingInvoice}
                        >
                          📄 Invoice
                        </button>
                        <button
                          onClick={() => cancelOrder(order.id)}
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

        {showInvoiceModal && selectedOrder && (
          <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
              <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Invoice</h2>

              {/* Customer Information */}
              <section style={invoiceSectionStyle}>
                <h3>Customer Information</h3>
                <p><strong>Name:</strong> {selectedOrder.customerName || "-"}</p>
                <p><strong>Email:</strong> {selectedOrder.userEmail || "-"}</p>
                <p><strong>Phone:</strong> {selectedOrder.customerPhone || "-"}</p>
                <p><strong>Delivery Address:</strong> {selectedOrder.deliveryAddress || "-"}</p>
              </section>

              {/* Cake Details */}
              <section style={invoiceSectionStyle}>
                <h3>Cake Details</h3>
                <p><strong>Cake Name:</strong> {selectedOrder.cakeName || "-"}</p>
                <p><strong>Size:</strong> {selectedOrder.cakeSize || "-"}</p>
                <p><strong>Quantity:</strong> {selectedOrder.quantity || 0}</p>
                <p><strong>Frosting Type:</strong> {selectedOrder.frostingType || "-"}</p>
                {selectedOrder.specialInstructions && (
                  <p><strong>Special Instructions:</strong> {selectedOrder.specialInstructions}</p>
                )}
              </section>

              {/* Delivery Info */}
              <section style={invoiceSectionStyle}>
                <h3>Delivery Information</h3>
                <p>
                  <strong>Date:</strong>{" "}
                  {selectedOrder.deliveryDate
                    ? new Date(selectedOrder.deliveryDate).toLocaleDateString()
                    : "-"}
                </p>
                <p><strong>Time:</strong> {selectedOrder.deliveryTime || "-"}</p>
              </section>

              {/* Payment Info */}
              <section style={invoiceSectionStyle}>
                <h3>Payment</h3>
                <p><strong>Method:</strong> {selectedOrder.paymentMethod || "-"}</p>
              </section>

              {/* Pricing */}
              <section style={invoiceSectionStyle}>
                <h3>Pricing</h3>
                <p><strong>Subtotal:</strong> ${selectedOrder.subtotal?.toFixed(2) || "0.00"}</p>
                <p><strong>Tax:</strong> ${selectedOrder.tax?.toFixed(2) || "0.00"}</p>
                <p><strong>Delivery Fee:</strong> ${selectedOrder.deliveryFee?.toFixed(2) || "0.00"}</p>
                <p><strong>Total:</strong> ${selectedOrder.total?.toFixed(2) || "0.00"}</p>
              </section>

              {/* Order Status */}
              <section style={invoiceSectionStyle}>
                <h3>Status</h3>
                <p>{selectedOrder.status || "-"}</p>
              </section>

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


        {/* EMPTY STATE */}
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

// ========== STYLES ==========
const sidebarStyle = {
  width: "280px",
  background: "linear-gradient(180deg, #2c3e50 0%, #34495e 100%)",
  minHeight: "100vh",
  padding: "0",
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

const navStyle = {
  padding: "20px 0",
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



const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
};

const modalContentStyle = {
  background: "white",
  padding: "30px 25px",
  borderRadius: "12px",
  maxWidth: "500px",
  width: "90%",
  maxHeight: "80vh",          // Limit the height to 80% of viewport
  overflowY: "auto",          // Add vertical scroll if content exceeds maxHeight
  boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
};

const invoiceSectionStyle = {
  marginBottom: "15px",
  paddingBottom: "10px",
  borderBottom: "1px solid #ddd",
};

const navIconStyle = {
  marginRight: "12px",
  fontSize: "16px",
};

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

const subtitleStyle = {
  fontSize: "16px",
  color: "#7f8c8d",
  margin: "0",
};

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

const refreshButtonStyle = (isLoading) => ({
  ...buttonBaseStyle,
  background: "#3498db",
  color: "white",
  opacity: isLoading ? 0.6 : 1,
  cursor: isLoading ? "not-allowed" : "pointer",
});

const buttonIconStyle = {
  fontSize: "14px",
};

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

const errorIconStyle = {
  fontSize: "16px",
};

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

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

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

const tableCellStyle = {
  padding: "16px",
  fontSize: "14px",
};

const orderIdStyle = {
  fontFamily: "'Monaco', 'Consolas', monospace",
  fontSize: "12px",
  color: "#7f8c8d",
  fontWeight: "500",
};

const customerCellStyle = {
  display: "flex",
  alignItems: "center",
};

const customerNameStyle = {
  fontWeight: "500",
  color: "#2c3e50",
};

const itemStyle = {
  color: "#34495e",
};

const priceStyle = {
  fontWeight: "600",
  color: "#27ae60",
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

const getStatusColor = (status) =>
{
  switch (status)
  {
    case "Preparing":
      return "#FFA726";
    case "Out for Delivery":
      return "#42A5F5";
    case "Delivered":
      return "#66BB6A";
    default:
      return "#7f8c8d";
  }
};

const actionButtonsStyle = {
  display: "flex",
  gap: "8px",
};

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

const emptyStateIconStyle = {
  fontSize: "64px",
  marginBottom: "20px",
};

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

// Add CSS animation for spinner
const style = document.createElement("style");
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

export default CustomerOrdersDashboard;
