// src/pages/PaymentMethod.jsx
import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GooglePayButton from "@google-pay/button-react";
import { apiService } from "../services/api";

const currencyCode = "LKR";
const countryCode = "LK";

export default function PaymentMethod() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const draft = state?.orderDraft || null;

  // Google Pay wants totalPrice as a string with 2 decimals
  // Keep hooks at top-level (before any conditional returns)
  const totalStr = useMemo(() => {
    const n = Number(draft?.total || 0);
    return n.toFixed(2);
  }, [draft?.total]);

  // Guard: if someone opens /payment directly
  if (!draft) {
    return (
      <div className="content-wrapper">
        <div className="content-box container">
          <section className="inside-page">
            <div className="inside-wrapper container">
              <div className="alert alert-warning">
                No order data found. Please select a cake and proceed again.
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

  const handlePaymentSuccess = async (paymentData) => {
    try {
      // Attach GPay payload + mark payment method
      const body = {
        ...draft,
        paymentMethod: "creditCard",
        paymentProvider: "google_pay",
        googlePay: {
          raw: paymentData, // keep full blob for records/audits
          token:
            paymentData?.paymentMethodData?.tokenizationData?.token || null,
          description: paymentData?.paymentMethodData?.description || "",
          info: paymentData?.paymentMethodData?.info || {},
        },
      };

      const res = await apiService.request("/order/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      const orderId = res?.order?.orderId || res?.orderId || res?._id || "N/A";
      alert(`🎉 Payment authorized & order created!\nOrder ID: ${orderId}`);
      navigate("/menu");
    } catch (err) {
      console.error("Order create failed after GPay auth:", err);
      const msg =
        err?.data?.error ||
        err?.message ||
        "Failed to save order after payment.";
      alert(`❌ ${msg}`);
    }
  };

  return (
    <div className="content-wrapper">
      <div className="content-box container">
        <section className="inside-page">
          <div
            className="inside-wrapper container"
            style={{ maxWidth: 900, margin: "0 auto" }}
          >
            <h2 style={{ color: "#ff6f61", marginBottom: 20 }}>
              Pay with Google Pay
            </h2>

            {/* Order Summary (read-only) */}
            <div
              className="box-hover"
              style={{
                background: "white",
                border: "1px solid #f6e4db",
                borderRadius: 12,
                padding: 20,
                marginBottom: 20,
              }}
            >
              <h4 style={{ marginTop: 0, marginBottom: 10 }}>Order Summary</h4>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                <div style={{ minWidth: 260, flex: 1 }}>
                  <div>
                    <strong>Product:</strong> {draft.productName || "(Cake)"}
                  </div>
                  <div>
                    <strong>Size:</strong> {draft.size}
                  </div>
                  <div>
                    <strong>Quantity:</strong> {draft.quantity}
                  </div>
                  <div>
                    <strong>Frosting:</strong> {draft.frosting}
                  </div>
                  {draft.specialInstructions ? (
                    <div>
                      <strong>Note:</strong> {draft.specialInstructions}
                    </div>
                  ) : null}
                </div>
                <div style={{ minWidth: 260, flex: 1 }}>
                  <div>
                    <strong>Deliver to:</strong> {draft.customerName}
                  </div>
                  <div>
                    <strong>Phone:</strong> {draft.customerPhone}
                  </div>
                  <div>
                    <strong>Address:</strong> {draft.deliveryAddress}
                  </div>
                  <div>
                    <strong>When:</strong> {draft.deliveryDate} &middot;{" "}
                    {draft.deliveryTime}
                  </div>
                </div>
                <div style={{ minWidth: 220 }}>
                  <div>
                    Subtotal: Rs{" "}
                    {Number(draft.subtotal || 0).toLocaleString("en-LK")}
                  </div>
                  <div>
                    Tax (8%): Rs{" "}
                    {Number(draft.tax || 0).toLocaleString("en-LK")}
                  </div>
                  <div>
                    Delivery: Rs{" "}
                    {Number(draft.deliveryFee || 0).toLocaleString("en-LK")}
                  </div>
                  <div style={{ fontWeight: "bold" }}>
                    Total: Rs {Number(draft.total || 0).toLocaleString("en-LK")}
                  </div>
                </div>
              </div>
            </div>

            {/* Google Pay (TEST environment) */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <GooglePayButton
                environment="TEST"
                buttonType="pay"
                buttonSizeMode="fill"
                paymentRequest={{
                  apiVersion: 2,
                  apiVersionMinor: 0,
                  allowedPaymentMethods: [
                    {
                      type: "CARD",
                      parameters: {
                        allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                        allowedCardNetworks: ["MASTERCARD", "VISA"],
                        billingAddressRequired: true,
                        billingAddressParameters: {
                          format: "FULL",
                        },
                      },
                      tokenizationSpecification: {
                        // TEST gateway. For production, replace with your PSP fields (e.g., Stripe, Adyen, etc.)
                        type: "PAYMENT_GATEWAY",
                        parameters: {
                          gateway: "example",
                          gatewayMerchantId: "exampleGatewayMerchantId",
                        },
                      },
                    },
                  ],
                  merchantInfo: {
                    // TEST merchant ID. Replace when you go live.
                    merchantId: "12345678901234567890",
                    merchantName: "Cake & Bake (Test)",
                  },
                  transactionInfo: {
                    totalPriceStatus: "FINAL",
                    totalPrice: totalStr,
                    currencyCode,
                    countryCode,
                  },
                  shippingAddressRequired: false,
                  emailRequired: true,
                }}
                onLoadPaymentData={handlePaymentSuccess}
                onCancel={() => {
                  // User canceled the sheet; let them go back to the order page.
                  navigate(-1);
                }}
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

      {/* Ensure any decorative overlays never block clicks */}
      <style>{`
        .divider-top, .divider-home { pointer-events: none !important; }
      `}</style>
    </div>
  );
}
