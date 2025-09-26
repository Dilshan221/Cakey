import asyncHandler from "express-async-handler";
import Order from "../models/orderModel.js";

/* POST /api/order/create */
export const createOrder = asyncHandler(async (req, res) => {
  console.log(
    "➡️ /api/order/create content-type:",
    req.headers["content-type"]
  );
  console.log("➡️ /api/order/create payload:", req.body);

  const {
    // product snapshot
    productId,
    productName,
    imageUrl,
    basePrice,

    // customer / delivery
    customerName,
    customerPhone,
    deliveryAddress,
    deliveryDate,
    deliveryTime,
    specialInstructions,

    // options
    size,
    quantity,
    frosting,
    messageOnCake,

    // payment
    paymentMethod,
    subtotal,
    tax,
    total,
    deliveryFee,
  } = req.body || {};

  // requireds
  if (!customerName || !customerPhone || !deliveryAddress || !deliveryDate) {
    res.status(400);
    throw new Error(
      "Please provide all required fields: customerName, customerPhone, deliveryAddress, and deliveryDate"
    );
  }

  const cleanPhone = (customerPhone || "").replace(/[\s\-\(\)\+]/g, "");
  if (!/^\d{10,15}$/.test(cleanPhone)) {
    res.status(400);
    throw new Error("Please provide a valid phone number (10-15 digits)");
  }

  const deliveryDateObj =
    typeof deliveryDate === "string" ? new Date(deliveryDate) : deliveryDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (!(deliveryDateObj instanceof Date) || isNaN(+deliveryDateObj)) {
    res.status(400);
    throw new Error("Invalid delivery date");
  }
  if (deliveryDateObj <= today) {
    res.status(400);
    throw new Error("Delivery date must be in the future");
  }

  const qty = parseInt(quantity, 10);
  if (!qty || qty < 1 || qty > 50) {
    res.status(400);
    throw new Error("Quantity must be between 1 and 50");
  }
  if (!["small", "medium", "large"].includes(size)) {
    res.status(400);
    throw new Error("Invalid cake size. Must be small, medium, or large");
  }
  if (!["butterCream", "creamCheese", "chocolateFrosting"].includes(frosting)) {
    res.status(400);
    throw new Error("Invalid frosting type");
  }
  if (!["creditCard", "afterpay", "cashOnDelivery"].includes(paymentMethod)) {
    res.status(400);
    throw new Error("Invalid payment method");
  }

  const snapshotName = (productName || "Chocolate Fudge Cake").trim();
  const snapshotBasePrice = Number(basePrice ?? subtotal ?? total ?? 0);
  if (isNaN(snapshotBasePrice)) {
    res.status(400);
    throw new Error("Invalid basePrice");
  }

  console.log("🖼 saving product.imageUrl:", imageUrl);

  const order = new Order({
    product: {
      id: productId || undefined,
      name: snapshotName,
      imageUrl: imageUrl || "", // <- stored in DB
      basePrice: snapshotBasePrice,
    },
    customer: {
      name: customerName.trim(),
      phone: cleanPhone,
      address: deliveryAddress.trim(),
    },
    item: {
      name: snapshotName,
      size,
      quantity: qty,
      frosting,
      messageOnCake: (messageOnCake || "").trim(),
    },
    delivery: {
      date: deliveryDateObj,
      time: deliveryTime || "afternoon",
      specialInstructions: (specialInstructions || "").trim(),
    },
    payment: {
      method: paymentMethod,
      subtotal: Number(subtotal) || 0,
      tax: Number(tax) || 0,
      deliveryFee: Number(deliveryFee ?? 500),
      total: Number(total) || 0,
    },
    price: Number(total) || 0,
    status: "Preparing",
  });

  try {
    const saved = await order.save();
    console.log(
      `✅ Order created: ${saved.orderId} • ${saved.customer.name} • Rs ${saved.payment.total}`
    );
    res.status(201).json({
      success: true,
      message: "Order created successfully!",
      order: {
        _id: saved._id,
        orderId: saved.orderId,
        product: saved.product, // includes name, imageUrl, basePrice
        customer: saved.customer.name,
        item: saved.item,
        total: saved.payment.total,
        deliveryDate: saved.delivery.date,
        status: saved.status,
      },
    });
  } catch (err) {
    console.error("❌ Order save failed:", err.message, err.errors);
    res
      .status(400)
      .json({ success: false, error: err.message, details: err.errors });
  }
});

/* GET /api/order/:id */
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  res.json({ success: true, order });
});

/* GET /api/order/track/:orderId */
export const getOrderByOrderId = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ orderId: req.params.orderId });
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  res.json({ success: true, order });
});

/* POST /api/order/validate */
export const validateOrderData = asyncHandler(async (req, res) => {
  const {
    customerName,
    customerPhone,
    deliveryAddress,
    deliveryDate,
    size,
    quantity,
  } = req.body || {};
  const errors = [];
  if (!customerName?.trim()) errors.push("Customer name is required");
  if (!customerPhone?.trim()) errors.push("Phone number is required");
  if (!deliveryAddress?.trim()) errors.push("Delivery address is required");
  if (!deliveryDate) errors.push("Delivery date is required");
  if (deliveryDate) {
    const dd = new Date(deliveryDate);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    if (dd <= t) errors.push("Delivery date must be in the future");
  }
  if (customerPhone) {
    const clean = customerPhone.replace(/[\s\-\(\)\+]/g, "");
    if (!/^\d{10,15}$/.test(clean))
      errors.push("Please provide a valid phone number (10-15 digits)");
  }
  const qty = parseInt(quantity, 10);
  if (!qty || qty < 1 || qty > 50)
    errors.push("Quantity must be between 1 and 50");
  if (!["small", "medium", "large"].includes(size))
    errors.push("Please select a valid cake size");
  if (errors.length) {
    res.status(400);
    throw new Error(`Validation failed: ${errors.join(", ")}`);
  }
  res.json({ success: true, message: "Order data is valid" });
});

/* POST /api/order/calculate-price */
export const calculateOrderPrice = asyncHandler(async (req, res) => {
  const { size, quantity, basePrice = 3000 } = req.body || {};
  const base = Number(basePrice) || 3000;

  let sizeMultiplier = 1;
  if (size === "medium") sizeMultiplier = 1.08;
  else if (size === "large") sizeMultiplier = 1.15;

  const qty = parseInt(quantity, 10) || 1;
  const unit = Math.round(base * sizeMultiplier);
  const subtotal = unit * qty;
  const tax = Math.round(subtotal * 0.08);
  const deliveryFee = 500;
  const total = subtotal + tax + deliveryFee;

  res.json({
    success: true,
    pricing: {
      basePrice: base,
      sizeMultiplier,
      unit,
      quantity: qty,
      subtotal,
      tax,
      deliveryFee,
      total,
    },
  });
});

/* GET /api/order/available-dates */
export const getAvailableDeliveryDates = asyncHandler(async (_req, res) => {
  const today = new Date();
  const availableDates = [];
  for (let i = 1; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d.getDay() !== 0) {
      availableDates.push({
        date: d.toISOString().split("T")[0],
        dayName: d.toLocaleDateString("en-US", { weekday: "long" }),
        available: true,
      });
    }
  }
  res.json({ success: true, availableDates });
});

/* GET /api/order/cake-options */
export const getCakeOptions = asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    cakeOptions: {
      sizes: [
        { value: "small", label: "Small (Serves 6–8)", price: 3000 },
        { value: "medium", label: "Medium (Serves 10–12)", price: 3240 },
        { value: "large", label: "Large (Serves 15–18)", price: 3450 },
      ],
      frostings: [
        { value: "butterCream", label: "Butter Cream" },
        { value: "creamCheese", label: "Cream Cheese" },
        { value: "chocolateFrosting", label: "Chocolate Ganache" },
      ],
      deliveryTimes: [
        { value: "morning", label: "Morning (9–12)" },
        { value: "afternoon", label: "Afternoon (12–4)" },
        { value: "evening", label: "Evening (4–7)" },
      ],
      paymentMethods: [
        { value: "creditCard", label: "Credit / Debit Card" },
        { value: "afterpay", label: "Afterpay" },
        { value: "cashOnDelivery", label: "Cash on Delivery" },
      ],
    },
  });
});
