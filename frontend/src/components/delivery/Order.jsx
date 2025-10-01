// src/components/delivery/Order.jsx
import React, { useState, useEffect } from "react";
import { apiService, API_BASE_URL } from "../../services/api";

export default function OrderPage() {
  const cake = {
    name: "Chocolate Fudge Cake",
    desc: "Indulge in our rich, moist chocolate fudge cake layered with smooth chocolate ganache and finished with decadent frosting.",
    basePrice: 22,
    image:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
  };

  const [size, setSize] = useState("medium");
  const [quantity, setQuantity] = useState(1);
  const [subtotal, setSubtotal] = useState(22);
  const [tax, setTax] = useState(1.76);
  const [total, setTotal] = useState(28.76);
  const [lastOrderId, setLastOrderId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const deliveryFee = 5;

  // totals
  useEffect(() => {
    let basePrice = cake.basePrice;
    if (size === "medium") basePrice += 5;
    if (size === "large") basePrice += 10;
    const qty = parseInt(quantity) || 1;
    const sub = basePrice * qty;
    const t = sub * 0.08;
    const tot = sub + t + deliveryFee;
    setSubtotal(sub);
    setTax(t);
    setTotal(tot);
  }, [size, quantity]);

  const todayStr = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const deliveryDate = new Date(e.target.deliveryDate.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (deliveryDate <= today) {
      alert("Please select a future delivery date");
      return;
    }

    const customerName = e.target.customerName.value.trim();
    const customerPhone = e.target.customerPhone.value.trim();
    const deliveryAddress = e.target.deliveryAddress.value.trim();
    if (!customerName || !customerPhone || !deliveryAddress) {
      alert("Please fill in all required fields");
      return;
    }

    const payload = {
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryDate: deliveryDate.toISOString().split("T")[0],
      deliveryTime: e.target.deliveryTime.value,
      specialInstructions: e.target.specialInstructions.value,
      size,
      quantity: Number(quantity),
      frosting: e.target.frosting.value,
      paymentMethod: e.target.payment.value, // creditCard | afterpay | cashOnDelivery
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      deliveryFee,
      total: Number(total.toFixed(2)),
    };

    try {
      setIsSubmitting(true);

      // Use shared API client (points to `${API_BASE_URL}/order/create`)
      const data = await apiService.createOrder(payload);

      const orderId = data?.order?.orderId || data?.orderId;
      if (!orderId) {
        throw new Error("Order created but no orderId returned");
      }

      setLastOrderId(orderId);
      alert(
        `🎉 Order placed successfully!\n\n📋 Order ID: ${orderId}\n🔗 API: ${API_BASE_URL}/order/...`
      );

      // reset
      e.target.reset();
      setSize("medium");
      setQuantity(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      alert(`❌ Failed to place order: ${err.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddToCart = () => {
    alert("Cake added to cart!");
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: "Arial", sans-serif; background: #fdfdfd; color: #333; line-height: 1.6; }
        .header { background: #ffe9dc; padding: 15px 30px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .logo h1 { font-family: "Brush Script MT", cursive; color: #e74c3c; font-size: 32px; }
        .nav a { margin-left: 20px; text-decoration: none; color: #333; font-weight: 500; }
        .nav a:hover { color: #e74c3c; }
        .container { max-width: 1000px; margin: 30px auto; padding: 0 20px; }
        .form-title { color: #ff6f61; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
        .cake-display { display: flex; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.08); margin-bottom: 30px; }
        .cake-image { width: 40%; object-fit: cover; }
        .cake-info { padding: 25px; width: 60%; }
        .cake-name { font-size: 28px; color: #e74c3c; margin-bottom: 15px; }
        .cake-desc { color: #666; margin-bottom: 15px; line-height: 1.6; }
        .cake-price { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 20px; }
        .order-form { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.05); margin-bottom: 25px; }
        .form-section { margin-bottom: 25px; }
        .section-title { color: #ff6f61; margin-bottom: 15px; }
        .form-row { display: flex; gap: 20px; margin-bottom: 15px; flex-wrap: wrap; }
        .form-group { flex: 1; min-width: 250px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: 500; }
        .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 15px; }
        .form-group textarea { min-height: 100px; resize: vertical; }
        .options-group { display: flex; flex-wrap: wrap; gap: 15px; }
        .option-item { display: flex; align-items: center; gap: 5px; }
        .cart-summary { background: #f9f9f9; padding: 20px; border-radius: 8px; margin-top: 20px; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .summary-total { font-weight: bold; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px; font-size: 18px; }
        .btn { padding: 12px 20px; font-size: 16px; border: none; border-radius: 6px; cursor: pointer; color: white; transition: 0.3s; margin-right: 10px; }
        .btn-primary { background: #ff6f61; }
        .btn-primary:hover { background: #e74c3c; }
        .btn-success { background: #27ae60; }
        .btn-success:hover { background: #1e8449; }
        .footer { background: #ffe9dc; text-align: center; padding: 20px; margin-top: 40px; }
      `}</style>

      <header className="header">
        <div className="logo">
          <h1>Cake & Bake</h1>
        </div>
        <nav className="nav">
          <a href="#">Dashboard</a>
          <a href="#">Menu</a>
          <a href="#">Order History</a>
          <a href="#">Contact</a>
        </nav>
      </header>

      <div className="container">
        {lastOrderId && (
          <div
            style={{
              background: "linear-gradient(135deg, #4CAF50, #45a049)",
              color: "white",
              padding: "20px",
              borderRadius: "12px",
              marginBottom: "25px",
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
              border: "2px solid #4CAF50",
            }}
          >
            <h3 style={{ margin: "0 0 10px 0", fontSize: "24px" }}>
              🎉 Order Placed Successfully!
            </h3>
            <p style={{ margin: "0 0 10px 0", fontSize: "18px" }}>
              <strong>📋 Your Order ID: {lastOrderId}</strong>
            </p>
            <p style={{ margin: 0, fontSize: "14px", opacity: 0.9 }}>
              • Use this ID to track your order.
            </p>
          </div>
        )}

        <h2 className="form-title">Complete Your Order</h2>

        <div className="cake-display">
          <img src={cake.image} alt={cake.name} className="cake-image" />
          <div className="cake-info">
            <h3 className="cake-name">{cake.name}</h3>
            <p className="cake-desc">{cake.desc}</p>
            <p className="cake-price">${cake.basePrice.toFixed(2)}</p>
            <div className="cake-details">
              <p>
                <strong>Serves:</strong> 8-10 people
              </p>
              <p>
                <strong>Preparation Time:</strong> 24 hours notice required
              </p>
              <p>
                <strong>Allergens:</strong> Contains gluten, dairy, eggs
              </p>
            </div>
          </div>
        </div>

        <form id="orderForm" className="order-form" onSubmit={handleSubmit}>
          {/* Cake Options */}
          <div className="form-section">
            <h3 className="section-title">Cake Options</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cakeSize">Size</label>
                <select
                  id="cakeSize"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                >
                  <option value="small">Small (Serves 6-8) - +$0.00</option>
                  <option value="medium">Medium (Serves 10-12) - +$5.00</option>
                  <option value="large">Large (Serves 15-18) - +$10.00</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="quantity">Quantity</label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Frosting Type</label>
              <div className="options-group">
                <div className="option-item">
                  <input
                    type="radio"
                    id="butterCream"
                    name="frosting"
                    value="butterCream"
                    defaultChecked
                  />
                  <label htmlFor="butterCream">Butter Cream</label>
                </div>
                <div className="option-item">
                  <input
                    type="radio"
                    id="creamCheese"
                    name="frosting"
                    value="creamCheese"
                  />
                  <label htmlFor="creamCheese">Cream Cheese</label>
                </div>
                <div className="option-item">
                  <input
                    type="radio"
                    id="chocolateFrosting"
                    name="frosting"
                    value="chocolateFrosting"
                  />
                  <label htmlFor="chocolateFrosting">Chocolate Ganache</label>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="form-section">
            <h3 className="section-title">Delivery Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="deliveryDate">Delivery Date</label>
                <input
                  type="date"
                  id="deliveryDate"
                  name="deliveryDate"
                  min={todayStr}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="deliveryTime">Preferred Time</label>
                <select id="deliveryTime" name="deliveryTime">
                  <option value="morning">Morning (9am - 12pm)</option>
                  <option value="afternoon">Afternoon (12pm - 4pm)</option>
                  <option value="evening">Evening (4pm - 7pm)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="customerName">Your Name</label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="customerPhone">Phone Number</label>
              <input
                type="tel"
                id="customerPhone"
                name="customerPhone"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="deliveryAddress">Delivery Address</label>
              <textarea id="deliveryAddress" name="deliveryAddress" required />
            </div>
            <div className="form-group">
              <label htmlFor="specialInstructions">Special Instructions</label>
              <textarea
                id="specialInstructions"
                name="specialInstructions"
                placeholder="Any specific delivery instructions or cake customization requests"
              />
            </div>
          </div>

          {/* Payment & Summary */}
          <div className="form-section">
            <h3 className="section-title">Order Summary</h3>

            <div className="form-group">
              <label>Payment Method</label>
              <div className="options-group">
                <div className="option-item">
                  <input
                    type="radio"
                    id="creditCard"
                    name="payment"
                    value="creditCard"
                    defaultChecked
                  />
                  <label htmlFor="creditCard">Credit Card</label>
                </div>
                <div className="option-item">
                  <input
                    type="radio"
                    id="afterpay"
                    name="payment"
                    value="afterpay"
                  />
                  <label htmlFor="afterpay">Afterpay</label>
                </div>
                <div className="option-item">
                  <input
                    type="radio"
                    id="cashOnDelivery"
                    name="payment"
                    value="cashOnDelivery"
                  />
                  <label htmlFor="cashOnDelivery">Cash on Delivery</label>
                </div>
              </div>
            </div>

            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span id="subtotal">${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Tax (8%):</span>
                <span id="tax">${tax.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee:</span>
                <span id="deliveryFee">${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="summary-row summary-total">
                <span>Total:</span>
                <span id="total">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ textAlign: "center", marginTop: "30px" }}>
            <button
              type="submit"
              className="btn btn-success"
              disabled={isSubmitting}
              style={{
                background: "#27ae60",
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? "🔄 Placing Order..." : "🎂 Place Order"}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddToCart}
              disabled={isSubmitting}
              style={{ background: "#ff6f61" }}
            >
              Add to Cart
            </button>
          </div>
        </form>
      </div>

      <footer className="footer">
        <p>
          &copy; {new Date().getFullYear()} Cake & Bake. All rights reserved.
        </p>
      </footer>
    </>
  );
}
