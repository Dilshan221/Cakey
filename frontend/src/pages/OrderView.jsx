import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import { authStorage } from "../utils/authStorage";

const PLACEHOLDER_IMG = "/assets/img/menu/price1.jpg";

export default function OrderView() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = authStorage.getUser();
    const userId = user?._id;

    if (!userId) {
      navigate("/login", {
        replace: true,
        state: { from: { pathname: "/myorders" } },
      });
      return;
    }

    apiService
      .getOrdersByCustomer(userId)
      .then((res) => {
        setOrders(res?.orders || []);
      })
      .catch((err) => {
        const msg = err?.data?.error || err?.message || "Failed to load orders";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return (
      <div className="content-wrapper">
        <div className="content-box container">
          <p>Loading your orders…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-wrapper">
        <div className="content-box container">
          <div className="alert alert-danger">{error}</div>
          <button className="btn btn-default" onClick={() => navigate("/menu")}>
            ← Back to Menu
          </button>
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="content-wrapper">
        <div className="content-box container">
          <h2 style={{ color: "#ff6f61", marginBottom: 12 }}>My Orders</h2>
          <p>You don’t have any orders yet.</p>
          <button className="btn btn-primary" onClick={() => navigate("/menu")}>
            Order Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <div className="content-box container">
        <h2 style={{ color: "#ff6f61", marginBottom: 20 }}>My Orders</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {orders.map((o) => {
            const deliveryDate = o?.delivery?.date
              ? new Date(o.delivery.date).toLocaleDateString()
              : "N/A";
            const deliveryTime = o?.delivery?.time || "N/A";
            const total = o?.payment?.total ?? o?.total ?? 0;
            const status = o?.status || "Preparing";

            // Prefer product snapshot; fallback to item
            const productName = o?.product?.name || o?.item?.name || "Cake";
            const productImg =
              o?.product?.imageUrl || o?.item?.imageUrl || PLACEHOLDER_IMG;

            return (
              <article
                key={o._id}
                style={{
                  border: "1px solid #f0d8cd",
                  borderRadius: 12,
                  background: "white",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                  display: "flex",
                  overflow: "hidden",
                }}
              >
                <img
                  src={productImg}
                  alt={productName}
                  style={{ width: 200, height: 160, objectFit: "cover" }}
                  onError={(e) => {
                    e.currentTarget.src = PLACEHOLDER_IMG;
                  }}
                />
                <div style={{ padding: 16, flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: "0 0 6px" }}>{productName}</h3>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                    <Chip label={`Order ID: ${o.orderId || o._id}`} />
                    <Chip
                      label={`Status: ${status}`}
                      color={
                        status === "Delivered"
                          ? "#2e7d32"
                          : status === "Out for Delivery"
                          ? "#1976d2"
                          : status === "Cancelled"
                          ? "#c62828"
                          : "#b66a5e"
                      }
                    />
                    <Chip
                      label={`Delivery: ${deliveryDate} (${deliveryTime})`}
                    />
                    <Chip
                      label={`Total: Rs ${Number(total).toLocaleString(
                        "en-LK"
                      )}`}
                    />
                    {o?.item?.size && <Chip label={`Size: ${o.item.size}`} />}
                    {o?.item?.quantity && (
                      <Chip label={`Qty: ${o.item.quantity}`} />
                    )}
                  </div>

                  {o?.item?.messageOnCake && (
                    <p style={{ marginTop: 10, color: "#555" }}>
                      🎉 Message: <em>{o.item.messageOnCake}</em>
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Small pill UI for metadata */
function Chip({ label, color = "#9c6e63" }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 999,
        border: "1px solid #f0d8cd",
        color,
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {label}
    </span>
  );
}
