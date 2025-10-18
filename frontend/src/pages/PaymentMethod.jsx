// src/pages/PaymentMethod.jsx
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GooglePayButton from "@google-pay/button-react";

const currencyCode = "LKR";
const countryCode = "LK";

export default function PaymentMethod() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const draft = state?.orderDraft || null;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  // total price as string with 2 decimals
  const totalStr = useMemo(() => (Number(draft?.total || 0)).toFixed(2), [draft?.total]);

  if (!draft) {
    return (
      <div className="content-wrapper">
        <div className="content-box container">
          <section className="inside-page">
            <div className="inside-wrapper container">
              <div className="alert alert-warning">
                No order data found. Please select a cake and proceed again.
              </div>
              <button className="btn btn-default" onClick={() => navigate("/menu")}>
                ← Back to Menu
              </button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  const handlePaymentSuccess = async (paymentData) => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const orderData = {
        ...draft,
        paymentMethod: draft.paymentMethod, // creditCard or afterpay
        paymentProvider: "google_pay",
        googlePay: {
          raw: paymentData,
          token: paymentData?.paymentMethodData?.tokenizationData?.token || null,
          description: paymentData?.paymentMethodData?.description || "",
          info: paymentData?.paymentMethodData?.info || {},
        },
      };

      const response = await fetch("http://localhost:8000/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create order");
      }

      setSuccess("🎉 Payment authorized & order created! You will receive a confirmation shortly.");
      alert(`🎉 Payment successful & order created!\nOrder ID: ${data._id || "N/A"}`);
      navigate("/menu");
    } catch (err) {
      console.error("Order create failed:", err);
      setError(err.message || "Failed to save order after payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-wrapper">
      <div className="content-box container">
        <section className="inside-page">
          <div className="inside-wrapper container" style={{ maxWidth: 900, margin: "0 auto" }}>
            <h2 style={{ color: "#ff6f61", marginBottom: 20 }}>Pay with Google Pay</h2>

            {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}
            {success && <div style={{ color: "green", marginBottom: 10 }}>{success}</div>}

            {/* Order Summary */}
            <div className="box-hover" style={{
              background: "white",
              border: "1px solid #f6e4db",
              borderRadius: 12,
              padding: 20,
              marginBottom: 20,
            }}>
              <h4 style={{ marginTop: 0, marginBottom: 10 }}>Order Summary</h4>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                <div style={{ minWidth: 260, flex: 1 }}>
                  <div><strong>Product:</strong> {draft.productName || "(Cake)"}</div>
                  <div><strong>Size:</strong> {draft.size}</div>
                  <div><strong>Quantity:</strong> {draft.quantity}</div>
                  <div><strong>Frosting:</strong> {draft.frosting}</div>
                  {draft.specialInstructions && <div><strong>Note:</strong> {draft.specialInstructions}</div>}
                </div>
                <div style={{ minWidth: 260, flex: 1 }}>
                  <div><strong>Deliver to:</strong> {draft.customerName}</div>
                  <div><strong>Phone:</strong> {draft.customerPhone}</div>
                  <div><strong>Address:</strong> {draft.deliveryAddress}</div>
                  <div><strong>When:</strong> {draft.deliveryDate} &middot; {draft.deliveryTime}</div>
                </div>
                <div style={{ minWidth: 220 }}>
                  <div>Subtotal: Rs {Number(draft.subtotal || 0).toLocaleString("en-LK")}</div>
                  <div>Tax (8%): Rs {Number(draft.tax || 0).toLocaleString("en-LK")}</div>
                  <div>Delivery: Rs {Number(draft.deliveryFee || 0).toLocaleString("en-LK")}</div>
                  <div style={{ fontWeight: "bold" }}>Total: Rs {Number(draft.total || 0).toLocaleString("en-LK")}</div>
                </div>
              </div>
            </div>

            {/* Google Pay Button */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <GooglePayButton
                environment="TEST"
                buttonType="pay"
                buttonSizeMode="fill"
                paymentRequest={{
                  apiVersion: 2,
                  apiVersionMinor: 0,
                  allowedPaymentMethods: [{
                    type: "CARD",
                    parameters: {
                      allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                      allowedCardNetworks: ["MASTERCARD", "VISA"],
                      billingAddressRequired: true,
                      billingAddressParameters: { format: "FULL" },
                    },
                    tokenizationSpecification: {
                      type: "PAYMENT_GATEWAY",
                      parameters: {
                        gateway: "example",
                        gatewayMerchantId: "exampleGatewayMerchantId",
                      },
                    },
                  }],
                  merchantInfo: { merchantId: "12345678901234567890", merchantName: "Cake & Bake (Test)" },
                  transactionInfo: { totalPriceStatus: "FINAL", totalPrice: totalStr, currencyCode, countryCode },
                  shippingAddressRequired: false,
                  emailRequired: true,
                }}
                onLoadPaymentData={handlePaymentSuccess}
                onCancel={() => navigate(-1)}
              />
            </div>

            <div style={{ marginTop: 16, textAlign: "center" }}>
              <button className="btn btn-default" onClick={() => navigate(-1)}>
                ← Back to Order
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
