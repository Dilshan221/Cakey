import mongoose from "mongoose";
import Order from "../models/orderModel.js";

const cleanPhone = (v = "") => (v || "").replace(/[\s\-()+]/g, "");
const isValidPhone = (v = "") => /^\d{10,15}$/.test(cleanPhone(v));

export const createOrder = async (req, res) => {
  try {
    const b = req.body || {};

    // Accept nested OR flat payloads
    const product = b.product || {
      id: b.productId,
      name: b.productName,
      imageUrl: b.imageUrl,
      basePrice: b.basePrice,
    };

    const customerId = b.customerId;

    const customer = b.customer || {
      name: b.customerName, // ⬅ may be empty
      phone: b.customerPhone,
      address: b.deliveryAddress,
    };

    const delivery = b.delivery || {
      date: b.deliveryDate,
      time: b.deliveryTime,
      specialInstructions: b.specialInstructions,
    };

    const item = b.item || {
      name: b.productName,
      size: b.size,
      quantity: b.quantity,
      frosting: b.frosting,
      messageOnCake: b.messageOnCake,
    };

    const payment = b.payment || {
      method: b.paymentMethod,
      subtotal: b.subtotal,
      tax: b.tax,
      deliveryFee: b.deliveryFee,
      total: b.total,
    };

    // ---------- Validation ----------
    if (!customerId)
      return res.status(400).json({ error: "customerId is required" });

    // ✅ name is OPTIONAL — do NOT enforce
    if (!isValidPhone(customer?.phone))
      return res
        .status(400)
        .json({ error: "Please provide a valid phone number (10-15 digits)" });

    if (!customer?.address?.trim())
      return res.status(400).json({ error: "deliveryAddress is required" });

    if (!delivery?.date)
      return res.status(400).json({ error: "deliveryDate is required" });

    if (!payment?.method)
      return res.status(400).json({ error: "paymentMethod is required" });

    // ---------- Create ----------
    const doc = await Order.create({
      product: {
        id: product?.id || undefined,
        name: (product?.name || "Chocolate Fudge Cake").trim(),
        imageUrl: product?.imageUrl || "",
        basePrice: Number(
          product?.basePrice ?? payment?.subtotal ?? payment?.total ?? 0
        ),
      },
      customerId,
      customer: {
        name: (customer?.name || "").trim(), // store empty string if absent
        phone: cleanPhone(customer.phone),
        address: customer.address.trim(),
      },
      item: {
        name: item?.name || product?.name || "Chocolate Fudge Cake",
        size: item?.size || "medium",
        quantity: Math.max(1, parseInt(item?.quantity || 1, 10)),
        frosting: item?.frosting || "butterCream",
        messageOnCake: (item?.messageOnCake || "").trim(),
      },
      delivery: {
        date: new Date(delivery.date),
        time: delivery?.time || "afternoon",
        specialInstructions: (delivery?.specialInstructions || "").trim(),
      },
      payment: {
        method: payment.method,
        subtotal: Number(payment?.subtotal) || 0,
        tax: Number(payment?.tax) || 0,
        deliveryFee: Number(payment?.deliveryFee ?? 500),
        total: Number(payment?.total) || 0,
      },
      price: Number(payment?.total ?? product?.basePrice ?? 0),
      status: "Preparing",
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully!",
      order: doc,
    });
  } catch (err) {
    console.error("❌ createOrder error:", err);
    return res
      .status(500)
      .json({ error: "Server error: could not create order" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid order id" });
    }
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    return res.json({ order });
  } catch (err) {
    console.error("❌ getOrderById error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getOrderByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) return res.status(400).json({ error: "orderId is required" });
    const order = await Order.findOne({ orderId });
    if (!order) return res.status(404).json({ error: "Order not found" });
    return res.json({ order });
  } catch (err) {
    console.error("❌ getOrderByOrderId error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const trackOrderByOrderId = (req, res) => getOrderByOrderId(req, res);

export const getOrdersByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    if (!customerId)
      return res.status(400).json({ error: "customerId is required" });
    const orders = await Order.find({ customerId })
      .sort({ createdAt: -1 })
      .limit(200);
    return res.json({ orders });
  } catch (err) {
    console.error("❌ getOrdersByCustomer error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const validateOrderData = async (req, res) => {
  try {
    const b = req.body || {};
    const customer = b.customer || {};
    const errors = [];

    // ✅ do NOT require name
    const phone = b.customerPhone || customer.phone;
    if (!isValidPhone(phone))
      errors.push("Valid 10–15 digit customerPhone is required");

    const address = b.deliveryAddress || customer.address;
    if (!address?.trim()) errors.push("deliveryAddress is required");

    const date = b.deliveryDate || b.delivery?.date;
    if (!date) errors.push("deliveryDate is required");

    const method = b.paymentMethod || b.payment?.method;
    if (!method) errors.push("paymentMethod is required");

    if (b.quantity && Number(b.quantity) < 1)
      errors.push("quantity must be at least 1");

    if (errors.length) return res.status(400).json({ valid: false, errors });
    return res.json({ valid: true });
  } catch (err) {
    console.error("❌ validateOrderData error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const calculateOrderPrice = async (req, res) => {
  try {
    const { basePrice = 0, size = "medium", qty = 1 } = req.body || {};
    const sizeAdj = size === "large" ? 0.15 : size === "medium" ? 0.08 : 0;
    const unit = Math.round(Number(basePrice) * (1 + sizeAdj));
    const quantity = Math.max(1, parseInt(qty || 1, 10));
    const subtotal = unit * quantity;
    const tax = Math.round(subtotal * 0.08);
    const deliveryFee = 500;
    const total = subtotal + tax + deliveryFee;
    return res.json({ unit, subtotal, tax, deliveryFee, total });
  } catch (err) {
    console.error("❌ calculateOrderPrice error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getAvailableDeliveryDates = async (_req, res) => {
  try {
    const days = [];
    const now = new Date();
    for (let i = 1; i <= 14; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      days.push(d.toISOString().split("T")[0]);
    }
    return res.json({ dates: days });
  } catch (err) {
    console.error("❌ getAvailableDeliveryDates error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getCakeOptions = async (_req, res) => {
  try {
    return res.json({
      sizes: [
        { value: "small", label: "Small", adj: 0 },
        { value: "medium", label: "Medium (+8%)", adj: 0.08 },
        { value: "large", label: "Large (+15%)", adj: 0.15 },
      ],
      frosting: [
        { value: "butterCream", label: "Butter Cream" },
        { value: "creamCheese", label: "Cream Cheese" },
        { value: "chocolateFrosting", label: "Chocolate Ganache" },
      ],
      timeSlots: ["morning", "afternoon", "evening"],
      deliveryFee: 500,
      taxRate: 0.08,
    });
  } catch (err) {
    console.error("❌ getCakeOptions error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
