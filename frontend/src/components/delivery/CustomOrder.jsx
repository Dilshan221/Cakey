import React, { useState } from "react";

export default function CustomCakeOrder()
{
  // State for form fields
  const [formData, setFormData] = useState({
    orderDate: new Date().toISOString().split("T")[0],
    releaseDate: "",
    deliveryMethod: "pickup",
    time: "",
    customerName: "",
    contactNumber: "",
    address: "",
    email: "",
    size: "",
    flavor: "",
    faculty: "",
    filling: "",
    addons: "",
    exclusions: "",
    theme: "",
    colors: "",
    inscription: "",
    designImage: null,
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [requestId, setRequestId] = useState("");

  // Handle input changes
  const handleInputChange = (e) =>
  {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  // Handle file upload click
  const handleFileUploadClick = () =>
  {
    document.getElementById("designImage").click();
  };

  // Handle form submission
  const handleSubmit = async (e) =>
  {
    e.preventDefault();

    try
    {
      const res = await fetch("http://localhost:8000/api/custom-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success)
      {
        const newRequestId = data.data.orderId; // Use backend generated orderId
        setRequestId(newRequestId);
        setShowConfirmation(true);
      } else
      {
        alert(" Failed: " + data.message);
      }
    } catch (err)
    {
      alert(" Error: " + err.message);
    }
  };

  // Handle form reset
  const handleReset = () =>
  {
    setFormData({
      orderDate: new Date().toISOString().split("T")[0],
      releaseDate: "",
      deliveryMethod: "pickup",
      time: "",
      customerName: "",
      contactNumber: "",
      address: "",
      email: "",
      size: "",
      flavor: "",
      filling: "",
      addons: "",
      exclusions: "",
      theme: "",
      colors: "",
      inscription: "",
      designImage: null,
    });
    setShowConfirmation(false);
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
  };

  const orderFormStyle = {
    background: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.05)",
    display: showConfirmation ? "none" : "block",
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
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: "100px",
    resize: "vertical",
  };

  const radioGroupStyle = {
    display: "flex",
    gap: "20px",
    marginTop: "5px",
  };

  const radioOptionStyle = {
    display: "flex",
    alignItems: "center",
    gap: "5px",
  };

  const fileUploadStyle = {
    border: "2px dashed #ddd",
    padding: "20px",
    textAlign: "center",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "0.3s",
  };

  const fileUploadHoverStyle = {
    borderColor: "#ff6f61",
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

  const btnResetStyle = {
    ...btnStyle,
    background: "#7f8c8d",
    marginLeft: "10px",
  };

  const btnResetHoverStyle = {
    background: "#626d6e",
  };

  const formActionsStyle = {
    textAlign: "center",
    marginTop: "20px",
  };

  const confirmationStyle = {
    display: showConfirmation ? "block" : "none",
    textAlign: "center",
    padding: "30px",
    background: "#f9f9f9",
    borderRadius: "12px",
    marginTop: "20px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.05)",
  };

  const highlightStyle = {
    color: "#ff6f61",
    fontWeight: "bold",
  };

  // Hover states
  const [hoverStates, setHoverStates] = useState({
    navLinks: {},
    fileUpload: false,
    submitButton: false,
    resetButton: false,
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
    ...(index === 1 && navLinkHoverStyle), // Active state for "Custom Order"
  });

  const getFileUploadStyle = () => ({
    ...fileUploadStyle,
    ...(hoverStates.fileUpload && fileUploadHoverStyle),
  });

  const getSubmitButtonStyle = () => ({
    ...btnSubmitStyle,
    ...(hoverStates.submitButton && btnSubmitHoverStyle),
  });

  const getResetButtonStyle = () => ({
    ...btnResetStyle,
    ...(hoverStates.resetButton && btnResetHoverStyle),
  });

  // Set minimum release date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minReleaseDate = tomorrow.toISOString().split("T")[0];

  return (
    <div style={mainContainerStyle}>
      {/* Sidebar */}
      <aside style={sidebarStyle}>
        <div style={logoStyle}>
          <h2 style={logoTextStyle}>Cake & Bake</h2>
        </div>
        <nav style={navStyle}>
          {["Home", "Cake Order", "Custom Cake Order"].map((item, index) =>
          {
            let link = "#";
            if (index === 0) link = "dash.html";
            else if (index === 1) link = "http://localhost:3000/normal-order";
            else if (index === 2) link = "http://localhost:3000/custom-order";

            return (
              <a
                key={item}
                href={link}
                style={getNavLinkStyle(index)}
                onMouseEnter={() => handleMouseEnter(`navLink${index}`)}
                onMouseLeave={() => handleMouseLeave(`navLink${index}`)}
              >
                {item}
              </a>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div style={mainContentStyle}>
        <h1 style={mainTitleStyle}>Custom Cake Order</h1>

        <form
          style={orderFormStyle}
          onSubmit={handleSubmit}
          onReset={handleReset}
        >
          {/* Order Information Section */}
          <div style={formSectionStyle}>
            <h2 style={sectionTitleStyle}>Order Information</h2>
            <div style={formRowStyle}>
              <div style={formGroupStyle}>
                <label htmlFor="orderDate" style={labelStyle}>
                  ORDER DATE:
                </label>
                <input
                  type="date"
                  id="orderDate"
                  name="orderDate"
                  value={formData.orderDate}
                  onChange={handleInputChange}
                  style={inputStyle}
                  required
                />
              </div>
              <div style={formGroupStyle}>
                <label htmlFor="releaseDate" style={labelStyle}>
                  RELEASE DATE:
                </label>
                <input
                  type="date"
                  id="releaseDate"
                  name="releaseDate"
                  value={formData.releaseDate}
                  onChange={handleInputChange}
                  min={minReleaseDate}
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Pick-Up/Delivery:</label>
              <div style={radioGroupStyle}>
                <div style={radioOptionStyle}>
                  <input
                    type="radio"
                    id="pickup"
                    name="deliveryMethod"
                    value="pickup"
                    checked={formData.deliveryMethod === "pickup"}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="pickup">Pick-Up</label>
                </div>
                <div style={radioOptionStyle}>
                  <input
                    type="radio"
                    id="delivery"
                    name="deliveryMethod"
                    value="delivery"
                    checked={formData.deliveryMethod === "delivery"}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="delivery">Delivery</label>
                </div>
              </div>
            </div>

            <div style={formGroupStyle}>
              <label htmlFor="time" style={labelStyle}>
                Time:
              </label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                style={inputStyle}
                required
              />
            </div>
          </div>

          {/* Customer Information Section */}
          <div style={formSectionStyle}>
            <h2 style={sectionTitleStyle}>Customer Information</h2>
            <div style={formRowStyle}>
              <div style={formGroupStyle}>
                <label htmlFor="customerName" style={labelStyle}>
                  Customer Name:
                </label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  style={inputStyle}
                  required
                />
              </div>
              <div style={formGroupStyle}>
                <label htmlFor="contactNumber" style={labelStyle}>
                  Contact #:
                </label>
                <input
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <div style={formGroupStyle}>
              <label htmlFor="address" style={labelStyle}>
                Address:
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                style={textareaStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label htmlFor="email" style={labelStyle}>
                Email:
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                style={inputStyle}
                required
              />
            </div>
          </div>

          {/* Order Details Section */}
          <div style={formSectionStyle}>
            <h2 style={sectionTitleStyle}>Order Details</h2>
            <div style={formRowStyle}>
              <div style={formGroupStyle}>
                <label htmlFor="size" style={labelStyle}>
                  Size:
                </label>
                <select
                  id="size"
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  style={inputStyle}
                  required
                >
                  <option value="">Select Size</option>
                  <option value="small">Small (6")</option>
                  <option value="medium">Medium (8")</option>
                  <option value="large">Large (10")</option>
                  <option value="xlarge">Extra Large (12")</option>
                </select>
              </div>
              <div style={formGroupStyle}>
                <label htmlFor="flavor" style={labelStyle}>
                  Flavor:
                </label>
                <select
                  id="flavor"
                  name="flavor"
                  value={formData.flavor}
                  onChange={handleInputChange}
                  style={inputStyle}
                  required
                >
                  <option value="">Select Flavor</option>
                  <option value="chocolate">Chocolate</option>
                  <option value="vanilla">Vanilla</option>
                  <option value="redVelvet">Red Velvet</option>
                  <option value="carrot">Carrot</option>
                  <option value="fruit">Fruit</option>
                  <option value="cheese">Cheese</option>
                </select>
              </div>
            </div>

            <div style={formGroupStyle}>
              <label htmlFor="filling" style={labelStyle}>
                Filling:
              </label>
              <select
                id="filling"
                name="filling"
                value={formData.filling}
                onChange={handleInputChange}
                style={inputStyle}
              >
                <option value="">Select Filling</option>
                <option value="buttercream">Buttercream</option>
                <option value="ganache">Chocolate Ganache</option>
                <option value="fruit">Fruit Preserve</option>
                <option value="custard">Custard</option>
                <option value="none">None</option>
              </select>
            </div>

            <div style={formGroupStyle}>
              <label htmlFor="addons" style={labelStyle}>
                Add-ons:
              </label>
              <textarea
                id="addons"
                name="addons"
                value={formData.addons}
                onChange={handleInputChange}
                placeholder="Additional items or special requests"
                style={textareaStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label htmlFor="exclusions" style={labelStyle}>
                Do Not Include:
              </label>
              <textarea
                id="exclusions"
                name="exclusions"
                value={formData.exclusions}
                onChange={handleInputChange}
                placeholder="Items to exclude or allergies"
                style={textareaStyle}
              />
            </div>
          </div>

          {/* Design Details Section */}
          <div style={formSectionStyle}>
            <h2 style={sectionTitleStyle}>Design Details</h2>
            <div style={formGroupStyle}>
              <label htmlFor="theme" style={labelStyle}>
                Theme:
              </label>
              <input
                type="text"
                id="theme"
                name="theme"
                value={formData.theme}
                onChange={handleInputChange}
                placeholder="e.g., Birthday, Wedding, Anniversary"
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label htmlFor="colors" style={labelStyle}>
                Colors:
              </label>
              <input
                type="text"
                id="colors"
                name="colors"
                value={formData.colors}
                onChange={handleInputChange}
                placeholder="e.g., Pink and Gold"
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label htmlFor="inscription" style={labelStyle}>
                Inscription:
              </label>
              <textarea
                id="inscription"
                name="inscription"
                value={formData.inscription}
                onChange={handleInputChange}
                placeholder="Text to be written on the cake"
                style={textareaStyle}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div style={formActionsStyle}>
            <button
              type="submit"
              style={getSubmitButtonStyle()}
              onMouseEnter={() => handleMouseEnter("submitButton")}
              onMouseLeave={() => handleMouseLeave("submitButton")}
            >
              Submit Request
            </button>
            <button
              type="reset"
              style={getResetButtonStyle()}
              onMouseEnter={() => handleMouseEnter("resetButton")}
              onMouseLeave={() => handleMouseLeave("resetButton")}
            >
              Reset Form
            </button>
          </div>
        </form>

        {/* Confirmation Message */}
        <div style={confirmationStyle}>
          <h2>Thank You for Your Order Request!</h2>
          <p>
            Your custom cake request has been submitted successfully. Our team
            will review your request and contact you within{" "}
            <span style={highlightStyle}>24 hours</span> to discuss the details
            and provide a quote.
          </p>
          <p>
            Once we've accepted your request, we'll provide payment
            instructions.
          </p>
          <p>
            Your request ID: <span style={highlightStyle}>{requestId}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
