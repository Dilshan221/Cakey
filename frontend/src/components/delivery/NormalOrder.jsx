import React, { useState, useEffect } from "react";
import { apiService } from "../../services/api";
import { useParams, useNavigate } from "react-router-dom";
import { authStorage } from "../../utils/authStorage";

export default function CakeOrder()
{
  const { id } = useParams(); // get cake id from URL
  const [cake, setCake] = useState(null);
  const [cakeSize, setCakeSize] = useState("medium");
  const [quantity, setQuantity] = useState(1);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("morning");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [frostingType, setFrostingType] = useState("Butter Cream");
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const deliveryFee = 5.0;


  useEffect(() =>
  {
    const fetchCake = async () =>
    {
      try
      {
        const data = await apiService.getProduct(id);
        setCake(data);
      } catch (err)
      {
        setError("Failed to load cake details.");
      }
    };
    fetchCake();
  }, [id]);

  // Calculate totals
  useEffect(() =>
  {
    if (!cake) return;

    let price = cake.price || 0;
    if (cakeSize === "medium") price += 5;
    if (cakeSize === "large") price += 10;

    const sub = price * (parseInt(quantity) || 1);
    const tx = sub * 0.08;
    const tot = sub + tx + deliveryFee;

    setSubtotal(sub);
    setTax(tx);
    setTotal(tot);
  }, [cake, cakeSize, quantity]);

  // API call to submit order
  const submitOrder = async (orderData) =>
  {
    try
    {
      const response = await fetch("http://localhost:8000/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok)
      {
        throw new Error(data.message || "Failed to create order");
      }

      return data;
    } catch (error)
    {
      throw error;
    }
  };

  // Handle form submit
  const handleSubmit = async (e) =>
  {
    e.preventDefault();
    setError("");
    setSuccess("");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chosenDate = new Date(deliveryDate);

    if (chosenDate <= today)
    {
      setError("Please select a future delivery date");
      return;
    }

    if (!customerName || !customerPhone || !deliveryAddress)
    {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try
    {
      const loggedInUser = authStorage.getUser();
      const userEmail = loggedInUser?.email || "";

      const orderData = {
        customerName,
        customerPhone,
        deliveryAddress,
        cakeName: cake?.name || "",
        cakeSize,
        quantity: parseInt(quantity) || 1,
        frostingType,
        specialInstructions,
        deliveryDate,
        deliveryTime,
        paymentMethod,
        subtotal: parseFloat(subtotal) || 0,
        tax: parseFloat(tax) || 0,
        deliveryFee: parseFloat(deliveryFee) || 0,
        total: parseFloat(total) || 0,
        userEmail,
      };

      if (paymentMethod === "Cash on Delivery")
      {
        // Submit order immediately
        const response = await fetch("http://localhost:8000/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        });
        const data = await response.json();

        if (!response.ok)
        {
          throw new Error(data.message || "Failed to create order");
        }

        setSuccess(
          "Order placed successfully! You will receive a confirmation shortly."
        );

        // Reset form
        setCakeSize("medium");
        setQuantity(1);
        setDeliveryDate("");
        setDeliveryTime("morning");
        setCustomerName("");
        setCustomerPhone("");
        setDeliveryAddress("");
        setFrostingType("Butter Cream");
        setPaymentMethod("Credit Card");
        setSpecialInstructions("");
      } else
      {
        // Navigate to PaymentMethod page with draft data
        navigate("/payment", { state: { orderDraft: orderData } });
      }
    } catch (err)
    {
      setError(err.message || "Failed to place order. Please try again.");
    } finally
    {
      setIsLoading(false);
    }
  };

  // ========== STYLES ==========
  const mainContainerStyle = {
    margin: 0,
    fontFamily: '"Arial", sans-serif',
    background: "#fdfdfd",
    color: "#333",
    display: "flex",
    minHeight: "100vh",
    overflow: "hidden",
  };

  const sidebarStyle = {
    width: "250px",
    background: "#ffe9dc",
    height: "100vh",
    padding: "20px",
    boxSizing: "border-box",
    position: "fixed",
    top: 0,
    left: 0,
    overflowY: "auto",
  };

  const logoStyle = {
    textAlign: "center",
    marginBottom: "30px",
  };

  const logoTextStyle = {
    fontFamily: '"Brush Script MT", cursive',
    color: "#e74c3c",
    margin: 0,
    fontSize: "2.5rem",
  };

  const navStyle = {
    display: "flex",
    flexDirection: "column",
  };

  const navLinkStyle = {
    display: "block",
    textDecoration: "none",
    padding: "12px 10px",
    color: "#333",
    margin: "5px 0",
    borderRadius: "6px",
    transition: "0.3s",
    fontWeight: 500,
  };

  const navLinkHoverStyle = {
    background: "#ff6f61",
    color: "white",
  };

  const mainContentStyle = {
    marginLeft: "250px",
    padding: "30px",
    width: "calc(100% - 250px)",
    boxSizing: "border-box",
    maxHeight: "100vh",
    overflowY: "auto",
    overflowX: "hidden",
  };

  const mainTitleStyle = {
    fontSize: "28px",
    marginBottom: "20px",
    color: "#e74c3c",
    textAlign: "center",
  };

  const cakeDisplayStyle = {
    display: "flex",
    background: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.05)",
    marginBottom: "30px",
  };

  const cakeImageStyle = {
    width: "40%",
    objectFit: "cover",
  };

  const cakeInfoStyle = {
    padding: "25px",
    width: "60%",
  };

  const cakeNameStyle = {
    fontSize: "1.8rem",
    color: "#2d3748",
    marginBottom: "10px",
    fontWeight: 600,
  };

  const cakeDescStyle = {
    color: "#718096",
    marginBottom: "15px",
    lineHeight: 1.6,
  };

  const cakePriceStyle = {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#e74c3c",
    marginBottom: "15px",
  };

  const orderFormStyle = {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.05)",
  };

  const formSectionStyle = {
    marginBottom: "25px",
    paddingBottom: "15px",
    borderBottom: "1px solid #eee",
  };

  const sectionTitleStyle = {
    color: "#ff6f61",
    marginBottom: "15px",
    fontSize: "20px",
  };

  const formRowStyle = {
    display: "flex",
    flexWrap: "wrap",
    marginBottom: "15px",
    gap: "20px",
  };

  const formGroupStyle = {
    flex: 1,
    minWidth: "250px",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontWeight: 500,
    color: "#4a5568",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
    background: "#fafafa",
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: "100px",
    resize: "vertical",
  };

  const optionsGroupStyle = {
    display: "flex",
    gap: "15px",
    marginTop: "10px",
    flexWrap: "wrap",
  };

  const optionItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    background: "#f7fafc",
    padding: "10px 15px",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
    transition: "0.3s",
  };

  const optionItemHoverStyle = {
    borderColor: "#ff6f61",
    background: "white",
  };

  const btnStyle = {
    padding: "12px 20px",
    fontSize: "16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    color: "white",
    transition: "0.3s",
    fontWeight: 500,
  };

  const btnSubmitStyle = {
    ...btnStyle,
    background: "#27ae60",
  };

  const btnSubmitHoverStyle = {
    background: "#1e8449",
  };

  const errorMessageStyle = {
    background: "#fed7d7",
    color: "#c53030",
    padding: "12px",
    borderRadius: "6px",
    margin: "15px 0",
    borderLeft: "4px solid #f56565",
  };

  const successMessageStyle = {
    background: "#c6f6d5",
    color: "#276749",
    padding: "12px",
    borderRadius: "6px",
    margin: "15px 0",
    borderLeft: "4px solid #48bb78",
  };

  const cartSummaryStyle = {
    background: "#f7fafc",
    padding: "20px",
    borderRadius: "8px",
    marginTop: "15px",
    border: "1px solid #e2e8f0",
  };

  const summaryRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #e2e8f0",
  };

  const summaryTotalStyle = {
    fontWeight: 700,
    fontSize: "1.1rem",
    color: "#2d3748",
    marginTop: "10px",
    paddingTop: "10px",
    borderTop: "2px solid #cbd5e0",
  };

  // State for hover effects
  const [hoverStates, setHoverStates] = useState({
    navLinks: {},
    optionItems: {},
    submitButton: false,
  });

  const handleMouseEnter = (element) =>
  {
    setHoverStates((prev) => ({ ...prev, [element]: true }));
  };

  const handleMouseLeave = (element) =>
  {
    setHoverStates((prev) => ({ ...prev, [element]: false }));
  };

  const getNavLinkStyle = (index) => ({
    ...navLinkStyle,
    ...(hoverStates[`navLink${index}`] && navLinkHoverStyle),
    ...(index === 1 && navLinkHoverStyle), // Active state for "Cake Order"
  });

  const getOptionItemStyle = (index) => ({
    ...optionItemStyle,
    ...(hoverStates[`optionItem${index}`] && optionItemHoverStyle),
  });

  const getSubmitButtonStyle = () => ({
    ...btnSubmitStyle,
    ...(hoverStates.submitButton && btnSubmitHoverStyle),
    opacity: isLoading ? 0.6 : 1,
    cursor: isLoading ? "not-allowed" : "pointer",
  });

  if (!cake) return <p>Loading cake details...</p>;

  return (
    <div style={mainContainerStyle}>

      {/* Main Content */}
      <div style={mainContentStyle}>
        <h1 style={mainTitleStyle}>Cake Order</h1>

        {/* Error Message */}
        {error && <div style={errorMessageStyle}>{error}</div>}

        {/* Success Message */}
        {success && <div style={successMessageStyle}>{success}</div>}

        {/* Cake Display */}
        <div style={cakeDisplayStyle}>
          <img src={cake.imageUrl} alt={cake.name} style={cakeImageStyle} />
          <div style={cakeInfoStyle}>
            <h3 style={cakeNameStyle}>{cake.name}</h3>
            <p style={cakeDescStyle}>{cake.description}</p>
            <p style={cakePriceStyle}>
              ${cake?.price ? cake.price.toFixed(2) : "0.00"}
            </p>
            <div>
              <p style={{ margin: "5px 0", color: "#4a5568" }}>
                <strong>Serves:</strong> 8-10 people
              </p>
              <p style={{ margin: "5px 0", color: "#4a5568" }}>
                <strong>Preparation Time:</strong> 24 hours notice required
              </p>
            </div>
          </div>
        </div>

        {/* Order Form */}
        <form onSubmit={handleSubmit} style={orderFormStyle}>
          {/* Cake Options */}
          <div style={formSectionStyle}>
            <h2 style={sectionTitleStyle}>Cake Options</h2>
            <div style={formRowStyle}>
              <div style={formGroupStyle}>
                <label htmlFor="cakeSize" style={labelStyle}>
                  Size
                </label>
                <select
                  id="cakeSize"
                  value={cakeSize}
                  onChange={(e) => setCakeSize(e.target.value)}
                  style={inputStyle}
                >
                  <option value="small">Small (Serves 6-8) - +$0.00</option>
                  <option value="medium">Medium (Serves 10-12) - +$5.00</option>
                  <option value="large">Large (Serves 15-18) - +$10.00</option>
                </select>
              </div>

              <div style={formGroupStyle}>
                <label htmlFor="quantity" style={labelStyle}>
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Frosting Type</label>
              <div style={optionsGroupStyle}>
                {["Butter Cream", "Cream Cheese", "Chocolate Ganache"].map(
                  (type, index) => (
                    <div
                      key={type}
                      style={getOptionItemStyle(index)}
                      onMouseEnter={() =>
                        handleMouseEnter(`optionItem${index}`)
                      }
                      onMouseLeave={() =>
                        handleMouseLeave(`optionItem${index}`)
                      }
                    >
                      <input
                        type="radio"
                        id={type.replace(/\s+/g, "")}
                        name="frosting"
                        value={type}
                        checked={frostingType === type}
                        onChange={(e) => setFrostingType(e.target.value)}
                        style={{
                          width: "16px",
                          height: "16px",
                          accentColor: "#ff6f61",
                        }}
                      />
                      <label
                        htmlFor={type.replace(/\s+/g, "")}
                        style={{ ...labelStyle, margin: 0, cursor: "pointer" }}
                      >
                        {type}
                      </label>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div style={formSectionStyle}>
            <h2 style={sectionTitleStyle}>Delivery Information</h2>
            <div style={formRowStyle}>
              <div style={formGroupStyle}>
                <label htmlFor="deliveryDate" style={labelStyle}>
                  Delivery Date
                </label>
                <input
                  type="date"
                  id="deliveryDate"
                  value={deliveryDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={formGroupStyle}>
                <label htmlFor="deliveryTime" style={labelStyle}>
                  Preferred Time
                </label>
                <select
                  id="deliveryTime"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  style={inputStyle}
                >
                  <option value="morning">Morning (9am - 12pm)</option>
                  <option value="afternoon">Afternoon (12pm - 4pm)</option>
                  <option value="evening">Evening (4pm - 7pm)</option>
                </select>
              </div>
            </div>

            <div style={formRowStyle}>
              <div style={formGroupStyle}>
                <label htmlFor="customerName" style={labelStyle}>
                  Your Name
                </label>
                <input
                  type="text"
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={formGroupStyle}>
                <label htmlFor="customerPhone" style={labelStyle}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="customerPhone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <div style={formGroupStyle}>
              <label htmlFor="deliveryAddress" style={labelStyle}>
                Delivery Address
              </label>
              <textarea
                id="deliveryAddress"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                style={textareaStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label htmlFor="specialInstructions" style={labelStyle}>
                Special Instructions
              </label>
              <textarea
                id="specialInstructions"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any specific delivery instructions or cake customization requests"
                style={textareaStyle}
              />
            </div>
          </div>

          {/* Payment & Summary */}
          <div style={formSectionStyle}>
            <h2 style={sectionTitleStyle}>Payment & Order Summary</h2>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Payment Method</label>
              <div style={optionsGroupStyle}>
                {["Credit Card", "Afterpay", "Cash on Delivery"].map(
                  (method, index) => (
                    <div
                      key={method}
                      style={getOptionItemStyle(index + 3)}
                      onMouseEnter={() =>
                        handleMouseEnter(`optionItem${index + 3}`)
                      }
                      onMouseLeave={() =>
                        handleMouseLeave(`optionItem${index + 3}`)
                      }
                    >
                      <input
                        type="radio"
                        id={method.replace(/\s+/g, "")}
                        name="payment"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        style={{
                          width: "16px",
                          height: "16px",
                          accentColor: "#ff6f61",
                        }}
                      />
                      <label
                        htmlFor={method.replace(/\s+/g, "")}
                        style={{ ...labelStyle, margin: 0, cursor: "pointer" }}
                      >
                        {method}
                      </label>
                    </div>
                  )
                )}
              </div>
            </div>

            <div style={cartSummaryStyle}>
              <div style={summaryRowStyle}>
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div style={summaryRowStyle}>
                <span>Tax (8%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div style={summaryRowStyle}>
                <span>Delivery Fee:</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
              <div style={{ ...summaryRowStyle, ...summaryTotalStyle }}>
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ textAlign: "center", marginTop: "30px" }}>
            <button
              type="submit"
              style={getSubmitButtonStyle()}
              disabled={isLoading}
              onMouseEnter={() => handleMouseEnter("submitButton")}
              onMouseLeave={() => handleMouseLeave("submitButton")}
            >
              {isLoading ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
