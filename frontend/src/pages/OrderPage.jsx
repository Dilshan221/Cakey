import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { apiService } from "../services/api";

const PLACEHOLDER_IMG = "/assets/img/menu/price1.jpg";

/* ------------------------------ Cart utils ------------------------------ */
const CART_KEY = "cb_cart";
const getCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
};
const setCart = (arr) => localStorage.setItem(CART_KEY, JSON.stringify(arr));
const addToCart = (product, qty = 1) => {
  const cart = getCart();
  const idx = cart.findIndex((x) => x._id === product._id);
  if (idx >= 0) cart[idx].qty += qty;
  else
    cart.push({
      _id: product._id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      qty,
    });
  setCart(cart);
  return cart;
};

/* ------------------------------ Helpers -------------------------------- */
const cleanPhone = (v = "") => (v || "").replace(/[\s\-()+]/g, "");
const isValidPhone = (v = "") => /^\d{10,15}$/.test(cleanPhone(v));

export default function OrderPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const params = useParams();

  // remove template scroll locks
  useEffect(() => {
    document.documentElement.style.overflowY = "auto";
    document.body.style.overflowY = "auto";
    document.body.style.overflow = "auto";
  }, []);

  // product (from state or fetched by :id)
  const productFromState = state?.product || null;
  const [product, setProduct] = useState(productFromState);
  const [loading, setLoading] = useState(!productFromState && !!params.id);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!productFromState && params.id) {
        try {
          setLoading(true);
          const p = await apiService.getProductById(params.id);
          if (!cancelled) setProduct(p);
        } catch (err) {
          if (!cancelled) setError(err?.message || "Failed to load product");
        } finally {
          if (!cancelled) setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  // If user hit /order directly (no :id and no state), route back
  useEffect(() => {
    if (!loading && !product) {
      const t = setTimeout(() => navigate("/menu"), 2000);
      return () => clearTimeout(t);
    }
  }, [loading, product, navigate]);

  /* ------------------------------ Form state ----------------------------- */
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState("medium");
  const [frosting, setFrosting] = useState("butterCream");
  const [payment, setPayment] = useState("creditCard");
  const [note, setNote] = useState("");

  const tomorrowISO = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  })();

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    date: tomorrowISO,
    timeSlot: "afternoon",
  });

  const [placing, setPlacing] = useState(false);
  const [lastOrderId, setLastOrderId] = useState(null);
  const [submitError, setSubmitError] = useState("");

  /* ------------------------------ Pricing ------------------------------- */
  const unitPrice = useMemo(() => Number(product?.price || 0), [product]);
  const sizeAdj = useMemo(
    () => (size === "large" ? 0.15 : size === "medium" ? 0.08 : 0),
    [size]
  );
  const effectiveUnit = useMemo(
    () => Math.round(unitPrice * (1 + sizeAdj)),
    [unitPrice, sizeAdj]
  );

  const safeQty = Math.max(1, parseInt(qty || 1, 10));
  const subtotal = useMemo(
    () => safeQty * effectiveUnit,
    [safeQty, effectiveUnit]
  );
  const tax = useMemo(() => Math.round(subtotal * 0.08), [subtotal]);
  const deliveryFee = 500;
  const total = useMemo(() => subtotal + tax + deliveryFee, [subtotal, tax]);

  const priceFmt = (n) => `Rs ${Number(n || 0).toLocaleString("en-LK")}`;
  const img = product?.imageUrl?.trim() ? product.imageUrl : PLACEHOLDER_IMG;

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, safeQty);
    alert(`Added "${product.name}" to cart`);
  };

  const validToSubmit =
    !!product &&
    customer.name.trim() &&
    isValidPhone(customer.phone) &&
    customer.address.trim() &&
    customer.date;

  // Build order draft for card payments
  const buildOrderDraft = () => {
    if (!product) return null;
    const imageUrl =
      product.imageUrl && product.imageUrl.trim()
        ? product.imageUrl
        : PLACEHOLDER_IMG;
    return {
      productId: product._id,
      productName: product.name,
      imageUrl, // <- always present
      basePrice: Number(product.price) || 0,

      customerName: customer.name,
      customerPhone: cleanPhone(customer.phone),
      deliveryAddress: customer.address,
      deliveryDate: customer.date,
      deliveryTime: customer.timeSlot,
      specialInstructions: note,

      size,
      quantity: Math.max(1, parseInt(qty || 1, 10)),
      frosting,

      subtotal,
      tax,
      total,
      deliveryFee,

      paymentMethod: "creditCard",
    };
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!product) {
      setSubmitError("No product selected. Please go back and choose a cake.");
      alert("No product selected. Please go back and choose a cake.");
      return;
    }
    if (!validToSubmit) {
      setSubmitError(
        "Please fill in all required fields (valid phone: 10–15 digits)."
      );
      alert("Please fill in all required fields.");
      return;
    }

    // card flow -> separate page
    if (payment === "creditCard") {
      const draft = buildOrderDraft();
      if (!draft) return;
      navigate("/payment", { state: { orderDraft: draft } });
      return;
    }

    // Afterpay / COD => create order now
    try {
      setPlacing(true);

      const imageUrl =
        product.imageUrl && product.imageUrl.trim()
          ? product.imageUrl
          : PLACEHOLDER_IMG;

      const payload = {
        productId: product._id,
        productName: product.name,
        imageUrl, // <- always present
        basePrice: Number(product.price) || 0,

        customerName: customer.name,
        customerPhone: cleanPhone(customer.phone),
        deliveryAddress: customer.address,
        deliveryDate: customer.date,
        deliveryTime: customer.timeSlot,
        specialInstructions: note,

        size,
        quantity: Math.max(1, parseInt(qty || 1, 10)),
        frosting,

        paymentMethod: payment,

        subtotal,
        tax,
        total,
        deliveryFee,
      };

      console.log("📤 Submitting order payload:", payload);

      const res = await apiService.request("/order/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });

      console.log("✅ Order API response:", res);

      const orderId = res?.order?.orderId || res?.orderId || res?._id || null;
      setLastOrderId(orderId);

      alert(
        `🎉 Order placed successfully!\n\n📋 Order ID: ${orderId || "N/A"}`
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("❌ Order submit failed:", err);
      const msg =
        err?.data?.error ||
        err?.message ||
        "Failed to place order. Please try again.";
      setSubmitError(msg);
      alert(`❌ Failed to place order: ${msg}`);
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="content-wrapper">
        <div className="content-box container">
          <section className="inside-page">
            <div className="inside-wrapper container">
              <p>Loading product…</p>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="content-wrapper">
        <div className="content-box container">
          <section className="inside-page">
            <div className="inside-wrapper container">
              <div className="alert alert-danger">
                {error || "Product not found. Redirecting to menu…"}
              </div>
              <button
                className="btn btn-default"
                onClick={() => navigate("/menu")}
              >
                ← Back to Menu
              </button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="content-wrapper">
      <div className="content-box container">
        <section className="inside-page">
          <div
            className="inside-wrapper container"
            style={{ width: "1200px", maxWidth: "100%", margin: "0 auto" }}
          >
            {lastOrderId && (
              <div
                className="alert alert-success"
                style={{
                  background: "linear-gradient(135deg, #4CAF50, #45a049)",
                  color: "white",
                  padding: "20px",
                  borderRadius: "12px",
                  marginBottom: "25px",
                  textAlign: "center",
                }}
              >
                <h3 style={{ margin: 0 }}>🎉 Order Placed Successfully!</h3>
                <p style={{ margin: "6px 0 0" }}>
                  <strong>📋 Order ID: {lastOrderId}</strong>
                </p>
                <small>📞 Keep this ID for tracking your order</small>
              </div>
            )}

            {!!submitError && (
              <div
                className="alert alert-danger"
                style={{ borderRadius: 10, marginBottom: 16 }}
              >
                {submitError}
              </div>
            )}

            <div className="col-md-12">
              <h2
                className="text-center-sm"
                style={{ color: "#ff6f61", marginBottom: "20px" }}
              >
                Complete Your Order
              </h2>
            </div>

            {/* Product card */}
            <div
              className="col-md-12"
              style={{
                display: "flex",
                background: "white",
                border: "1px solid #f0d8cd",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 4px 8px rgba(0,0,0,0.06)",
                marginBottom: "30px",
                gap: 0,
              }}
            >
              <img
                src={img}
                alt={product.name}
                style={{
                  width: "40%",
                  height: "300px",
                  objectFit: "cover",
                  borderRadius: "12px",
                }}
                onError={(e) => {
                  e.currentTarget.src = PLACEHOLDER_IMG;
                }}
              />
              <div style={{ padding: "24px", width: "60%" }}>
                <h3
                  style={{
                    fontSize: "32px",
                    color: "#e74c3c",
                    marginTop: 0,
                    marginBottom: 6,
                  }}
                >
                  {product.name}
                </h3>
                {product.category && (
                  <div
                    style={{
                      display: "inline-block",
                      padding: "2px 10px",
                      borderRadius: 999,
                      border: "1px solid #f0d8cd",
                      color: "#b66a5e",
                      marginBottom: 10,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {product.category}
                  </div>
                )}
                <p style={{ color: "#666", marginBottom: "14px" }}>
                  {product.description || "A delicious cake from Cake & Bake."}
                </p>
                <p
                  style={{
                    fontSize: "22px",
                    fontWeight: "bold",
                    marginBottom: 0,
                  }}
                >
                  Base Price: {priceFmt(product.price)}
                </p>
                <small style={{ color: "#666" }}>
                  Size adj.:{" "}
                  {size === "small" ? "0%" : size === "medium" ? "+8%" : "+15%"}
                </small>
              </div>
            </div>

            {/* Order form */}
            <div className="col-md-12">
              <form
                className="order-form box-hover"
                onSubmit={placeOrder}
                style={{
                  background: "white",
                  padding: "24px",
                  borderRadius: "12px",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                  border: "1px solid #f6e4db",
                  position: "relative",
                  zIndex: 3,
                }}
              >
                {/* Options */}
                <div className="form-section">
                  <h3 style={{ color: "#ff6f61" }}>Cake Options</h3>
                  <div
                    style={{
                      display: "flex",
                      gap: "20px",
                      margin: "15px 0",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <label>Size</label>
                      <select
                        value={size}
                        onChange={(e) => setSize(e.target.value)}
                        className="form-control"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium (+8%)</option>
                        <option value="large">Large (+15%)</option>
                      </select>
                    </div>

                    <div style={{ flex: 1, minWidth: 220 }}>
                      <label>Frosting</label>
                      <select
                        value={frosting}
                        onChange={(e) => setFrosting(e.target.value)}
                        className="form-control"
                      >
                        <option value="butterCream">Butter Cream</option>
                        <option value="creamCheese">Cream Cheese</option>
                        <option value="chocolateFrosting">
                          Chocolate Ganache
                        </option>
                      </select>
                    </div>

                    <div style={{ flex: 1, minWidth: 220 }}>
                      <label>Quantity</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={qty}
                        onChange={(e) => setQty(e.target.value)}
                        className="form-control"
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <label>Message on cake (optional)</label>
                    <input
                      type="text"
                      placeholder="Happy Birthday Tharindu!"
                      className="form-control"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="form-section" style={{ marginTop: 18 }}>
                  <h3 style={{ color: "#ff6f61" }}>Delivery Information</h3>
                  <div className="row" style={{ marginBottom: 10 }}>
                    <div className="col-md-6" style={{ marginBottom: 10 }}>
                      <label>Delivery Date</label>
                      <input
                        type="date"
                        min={tomorrowISO}
                        value={customer.date}
                        onChange={(e) =>
                          setCustomer((s) => ({ ...s, date: e.target.value }))
                        }
                        required
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-6" style={{ marginBottom: 10 }}>
                      <label>Preferred Time</label>
                      <select
                        className="form-control"
                        value={customer.timeSlot}
                        onChange={(e) =>
                          setCustomer((s) => ({
                            ...s,
                            timeSlot: e.target.value,
                          }))
                        }
                      >
                        <option value="morning">Morning</option>
                        <option value="afternoon">Afternoon</option>
                        <option value="evening">Evening</option>
                      </select>
                    </div>
                  </div>
                  <div className="row" style={{ marginBottom: 10 }}>
                    <div className="col-md-6" style={{ marginBottom: 10 }}>
                      <label>Your Name</label>
                      <input
                        type="text"
                        value={customer.name}
                        onChange={(e) =>
                          setCustomer((s) => ({ ...s, name: e.target.value }))
                        }
                        required
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-6" style={{ marginBottom: 10 }}>
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        value={customer.phone}
                        onChange={(e) =>
                          setCustomer((s) => ({ ...s, phone: e.target.value }))
                        }
                        required
                        className="form-control"
                        placeholder="0771234567"
                      />
                      <small style={{ color: "#666" }}>
                        Enter 10–15 digits (numbers only).
                      </small>
                    </div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label>Address</label>
                    <textarea
                      value={customer.address}
                      onChange={(e) =>
                        setCustomer((s) => ({ ...s, address: e.target.value }))
                      }
                      required
                      className="form-control"
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="form-section" style={{ marginTop: 18 }}>
                  <h3 style={{ color: "#ff6f61" }}>Order Summary</h3>
                  <p>Unit: {priceFmt(effectiveUnit)}</p>
                  <p>Subtotal: {priceFmt(subtotal)}</p>
                  <p>Tax (8%): {priceFmt(tax)}</p>
                  <p>Delivery Fee: {priceFmt(deliveryFee)}</p>
                  <p style={{ fontWeight: "bold" }}>Total: {priceFmt(total)}</p>

                  <div style={{ margin: "15px 0" }}>
                    <label>Payment Method</label>
                    <div className="row">
                      <div className="col-md-4">
                        <label style={{ display: "block", fontWeight: 400 }}>
                          <input
                            type="radio"
                            name="payment"
                            value="creditCard"
                            checked={payment === "creditCard"}
                            onChange={() => {
                              setPayment("creditCard");
                              if (
                                !customer.name ||
                                !isValidPhone(customer.phone) ||
                                !customer.address ||
                                !customer.date
                              ) {
                                alert(
                                  "Please fill delivery information (valid phone: 10–15 digits) before paying."
                                );
                                return;
                              }
                              const draft = buildOrderDraft();
                              if (!draft) return;
                              navigate("/payment", {
                                state: { orderDraft: draft },
                              });
                            }}
                            style={{ marginRight: 6 }}
                          />
                          Credit / Debit Card
                        </label>
                      </div>
                      <div className="col-md-4">
                        <label style={{ display: "block", fontWeight: 400 }}>
                          <input
                            type="radio"
                            name="payment"
                            value="afterpay"
                            checked={payment === "afterpay"}
                            onChange={() => setPayment("afterpay")}
                            style={{ marginRight: 6 }}
                          />
                          Afterpay
                        </label>
                      </div>
                      <div className="col-md-4">
                        <label style={{ display: "block", fontWeight: 400 }}>
                          <input
                            type="radio"
                            name="payment"
                            value="cashOnDelivery"
                            checked={payment === "cashOnDelivery"}
                            onChange={() => setPayment("cashOnDelivery")}
                            style={{ marginRight: 6 }}
                          />
                          Cash on Delivery
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ textAlign: "center" }}>
                  <button
                    type="submit"
                    disabled={placing || !validToSubmit}
                    className="btn btn-success"
                    style={{
                      padding: "12px 20px",
                      marginRight: 10,
                      borderRadius: 6,
                    }}
                    title={
                      validToSubmit
                        ? "Place Order"
                        : "Fill all required fields to enable"
                    }
                  >
                    {placing ? "🔄 Placing Order..." : "🎂 Place Order"}
                  </button>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="btn btn-primary"
                    style={{
                      padding: "12px 20px",
                      borderRadius: 6,
                      background: "#ff6f61",
                      borderColor: "#ff6f61",
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Decorative divider must not block clicks */}
        <div className="divider-top divider-home" />
      </div>

      <style>{`
        .divider-top, .divider-home { pointer-events: none !important; }
        .inside-page .inside-wrapper { position: relative; z-index: 2; }
        .order-form { position: relative; z-index: 3; }
      `}</style>
    </div>
  );
}
