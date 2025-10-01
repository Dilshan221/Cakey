import React, { useState, useEffect } from "react";

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    preparing: 0,
    outForDelivery: 0,
    delivered: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Base URL for your backend API
  const API_BASE_URL = "http://localhost:5000/api/dashboard"; // Updated to match backend routes

  // Fetch all orders from backend
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/orders`);
      const data = await response.json();

      if (response.ok) {
        // Transform backend data to match frontend format
        const transformedOrders = data.orders.map((order) => ({
          id: order.orderId,
          customer: order.customer.name,
          item: order.item.name,
          price: order.payment.total,
          status: order.status,
          _id: order._id, // Keep MongoDB ID for backend operations
        }));
        setOrders(transformedOrders);
      } else {
        setError(data.message || "Failed to fetch orders");
        setOrders([]); // Set empty array if no orders found
      }
    } catch (err) {
      setError("Network error: Unable to fetch orders");
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch order statistics from backend
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      const data = await response.json();

      if (response.ok) {
        setStats(data.stats.orders);
      } else {
        console.error("Failed to fetch stats:", data.message);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  // Update order status in backend
  const updateStatus = async (index, newStatus) => {
    const order = orders[index];
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${order._id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state
        const updatedOrders = [...orders];
        updatedOrders[index].status = newStatus;
        setOrders(updatedOrders);

        // Refresh stats
        fetchStats();

        alert(`Order ${order.id} status updated to ${newStatus}`);
      } else {
        alert(`Failed to update order: ${data.message}`);
      }
    } catch (err) {
      console.error("Error updating order:", err);
      alert("Network error: Failed to update order status");
    }
  };

  // Cancel order in backend
  const cancelOrder = async (index) => {
    const order = orders[index];

    if (window.confirm(`Are you sure you want to cancel and delete ${order.id}?\n\nThis will permanently remove the order from the database.`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/orders/${order._id}/cancel`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok) {
          // Remove from local state since order is deleted
          const updatedOrders = orders.filter((_, i) => i !== index);
          setOrders(updatedOrders);

          // Refresh stats
          fetchStats();

          alert(`✅ Order ${order.id} has been cancelled and permanently deleted from the database`);
        } else {
          alert(`Failed to cancel order: ${data.message}`);
        }
      } catch (err) {
        console.error("Error cancelling order:", err);
        alert("Network error: Failed to cancel order");
      }
    }
  };

  // View invoice
  const viewInvoice = async (index) => {
    const order = orders[index];
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${order._id}/invoice`);
      const data = await response.json();

      if (response.ok) {
        // You can implement a proper invoice modal here
        // For now, just show alert with invoice data
        const invoice = data.invoice;
        alert(`Invoice for ${invoice.orderId}\n
Customer: ${invoice.customer}\n
Item: ${invoice.item}\n
Amount: $${invoice.totalAmount}\n
Order Date: ${new Date(invoice.orderDate).toLocaleDateString()}\n
Status: ${invoice.status}`);
      } else {
        alert(`Failed to get invoice: ${data.message}`);
      }
    } catch (err) {
      console.error("Error fetching invoice:", err);
      alert("Network error: Failed to fetch invoice");
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          fontSize: "18px",
          color: "#ff6f61",
        }}
      >
        Loading orders...
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        fontFamily: "Arial, sans-serif",
        background: "#fdfdfd",
        color: "#333",
        minHeight: "100vh",
        margin: 0,
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: "250px",
          background: "#ffe9dc",
          padding: "20px",
          boxSizing: "border-box",
          position: "fixed",
          top: 0,
          left: 0,
          minHeight: "100vh",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2
            style={{
              fontFamily: '"Brush Script MT", cursive',
              color: "#e74c3c",
            }}
          >
            Cake & Bake
          </h2>
        </div>
        <nav>
          {[
            "Dashboard",
            "Orders",
            "Customers",
            "Menu",
            "Reports",
            "Settings",
          ].map((item, i) => (
            <a
              key={i}
              href="#"
              style={{
                display: "block",
                textDecoration: "none",
                padding: "12px 10px",
                color: item === "Dashboard" ? "white" : "#333",
                margin: "5px 0",
                borderRadius: "6px",
                transition: "0.3s",
                fontWeight: 500,
                background: item === "Dashboard" ? "#ff6f61" : "transparent",
              }}
            >
              {item}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div
        style={{
          marginLeft: "250px",
          padding: "30px",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h1
            style={{
              fontSize: "28px",
              margin: 0,
              color: "#e74c3c",
            }}
          >
            Customer Orders
          </h1>
          <button
            onClick={() => {
              fetchOrders();
              fetchStats();
            }}
            style={{
              padding: "10px 20px",
              backgroundColor: "#ff6f61",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Refresh
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              background: "#ffe6e6",
              color: "#d32f2f",
              padding: "10px",
              borderRadius: "6px",
              marginBottom: "20px",
              border: "1px solid #ffcdd2",
            }}
          >
            {error}
          </div>
        )}

        {/* Order Count */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginBottom: "25px",
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "Total Orders", value: stats.total },
            { label: "Preparing", value: stats.preparing },
            { label: "Out for Delivery", value: stats.outForDelivery },
            { label: "Delivered", value: stats.delivered },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "12px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.05)",
                flex: 1,
                minWidth: "180px",
                textAlign: "center",
              }}
            >
              <h2 style={{ fontSize: "32px", color: "#ff6f61", margin: 0 }}>
                {stat.value}
              </h2>
              <p style={{ fontSize: "16px", color: "#555", margin: "5px 0 0" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Orders Table */}
        {orders.length > 0 ? (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "white",
              borderRadius: "10px",
              overflow: "hidden",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.05)",
            }}
          >
            <thead style={{ background: "#ff6f61", color: "white" }}>
              <tr>
                {[
                  "Order ID",
                  "Customer",
                  "Item",
                  "Total Price",
                  "Update Status",
                  "Invoice",
                  "Cancel",
                ].map((head, i) => (
                  <th
                    key={i}
                    style={{
                      padding: "14px 16px",
                      textAlign: "center",
                    }}
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr
                  key={order.id}
                  style={{ borderBottom: "1px solid #eee", cursor: "pointer" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f9f9f9")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td style={{ padding: "14px 16px", textAlign: "center" }}>
                    {order.id}
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "center" }}>
                    {order.customer}
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "center" }}>
                    {order.item}
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "center" }}>
                    ${order.price}
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "center" }}>
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(index, e.target.value)}
                      style={{
                        padding: "6px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        fontSize: "14px",
                      }}
                    >
                      <option>Preparing</option>
                      <option>Out for Delivery</option>
                      <option>Delivered</option>
                    </select>
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "center" }}>
                    <button
                      onClick={() => viewInvoice(index)}
                      style={{
                        padding: "8px 14px",
                        fontSize: "14px",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        color: "white",
                        background: "#27ae60",
                        transition: "0.3s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.background = "#1e8449")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.background = "#27ae60")
                      }
                    >
                      View Invoice
                    </button>
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "center" }}>
                    <button
                      onClick={() => cancelOrder(index)}
                      style={{
                        padding: "8px 14px",
                        fontSize: "14px",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        color: "white",
                        background: "#e74c3c",
                        transition: "0.3s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.background = "#c0392b")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.background = "#e74c3c")
                      }
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              background: "white",
              borderRadius: "10px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.05)",
            }}
          >
            <h3 style={{ color: "#ff6f61", marginBottom: "10px" }}>
              No Orders Found
            </h3>
            <p style={{ color: "#666" }}>
              There are currently no orders to display.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
