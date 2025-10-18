import Order from "../../models/delivery/OrderModel.js";

// GET ALL ORDERS
export const getAllOrders = async (req, res) =>
{
  try
  {
    const orders = await Order.find().sort({ createdAt: -1 });

    if (!orders || orders.length === 0)
    {
      return res.status(404).json({
        success: false,
        message: "No orders found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      count: orders.length,
      orders: orders,
    });
  } catch (err)
  {
    console.error("Error in getAllOrders:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
    });
  }
};

// CREATE NEW ORDER
export const addOrder = async (req, res) =>
{
  try
  {
    const {
      customerName,
      customerPhone,
      deliveryAddress,
      cakeName,
      cakeSize,
      quantity,
      frostingType,
      specialInstructions,
      deliveryDate,
      deliveryTime,
      paymentMethod,
      subtotal,
      tax,
      deliveryFee,
      total,
      userEmail,
    } = req.body;

    const requiredFields = [
      customerName,
      customerPhone,
      deliveryAddress,
      cakeName,
      cakeSize,
      quantity,
      frostingType,
      deliveryDate,
      deliveryTime,
      paymentMethod,
      subtotal,
      tax,
      total,
      userEmail,
    ];

    if (requiredFields.some((field) => !field))
    {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const validSizes = ["small", "medium", "large"];
    if (!validSizes.includes(cakeSize))
    {
      return res.status(400).json({
        success: false,
        message: "Invalid cake size. Choose: small, medium, or large",
      });
    }

    const validFrostings = [
      "Butter Cream",
      "Cream Cheese",
      "Chocolate Ganache",
    ];
    if (!validFrostings.includes(frostingType))
    {
      return res.status(400).json({
        success: false,
        message: "Invalid frosting type",
      });
    }

    const validPayments = ["Credit Card", "Afterpay", "Cash on Delivery"];
    if (!validPayments.includes(paymentMethod))
    {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    const newOrder = new Order({
      customerName,
      customerPhone,
      deliveryAddress,
      cakeName,
      cakeSize,
      quantity: parseInt(quantity),
      frostingType,
      specialInstructions: specialInstructions || "",
      deliveryDate: new Date(deliveryDate),
      deliveryTime,
      paymentMethod,
      subtotal: parseFloat(subtotal),
      tax: parseFloat(tax),
      deliveryFee: parseFloat(deliveryFee) || 5.0,
      total: parseFloat(total),
      userEmail
    });

    await newOrder.save();

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (err)
  {
    console.error("Error in addOrder:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while creating order",
    });
  }
};

// GET ORDER BY ID
export const getById = async (req, res) =>
{
  try
  {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order)
    {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      order: order,
    });
  } catch (err)
  {
    console.error("Error in getById:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching order",
    });
  }
};

// UPDATE ORDER
export const updateOrder = async (req, res) =>
{
  try
  {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.status)
    {
      const validStatuses = [
        "Preparing",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ];
      if (!validStatuses.includes(updateData.status))
      {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }
    }

    const updatedOrder = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedOrder)
    {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (err)
  {
    console.error("Error in updateOrder:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while updating order",
    });
  }
};

// DELETE ORDER
export const deleteOrder = async (req, res) =>
{
  try
  {
    const { id } = req.params;

    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder)
    {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order deleted successfully",
      order: deletedOrder,
    });
  } catch (err)
  {
    console.error("Error in deleteOrder:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting order",
    });
  }
};

// UPDATE ORDER STATUS
export const updateStatus = async (req, res) =>
{
  try
  {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "Preparing",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];
    if (!validStatuses.includes(status))
    {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Choose: Preparing, Out for Delivery, Delivered, or Cancelled",
      });
    }

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

    if (!order)
    {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: order,
    });
  } catch (err)
  {
    console.error("Error in updateStatus:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while updating status",
    });
  }
};

// GET ORDERS BY STATUS
export const getByStatus = async (req, res) =>
{
  try
  {
    const { status } = req.params;

    const orders = await Order.find({ status }).sort({ createdAt: -1 });

    if (!orders || orders.length === 0)
    {
      return res.status(404).json({
        success: false,
        message: `No orders found with status: ${status}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Orders with status ${status} fetched successfully`,
      count: orders.length,
      orders: orders,
    });
  } catch (err)
  {
    console.error("Error in getByStatus:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching orders by status",
    });
  }
};

// GET ORDERS BY CUSTOMER NAME
export const getByCustomer = async (req, res) =>
{
  try
  {
    const { customerName } = req.params;

    const orders = await Order.find({
      customerName: { $regex: customerName, $options: "i" },
    }).sort({ createdAt: -1 });

    if (!orders || orders.length === 0)
    {
      return res.status(404).json({
        success: false,
        message: `No orders found for customer: ${customerName}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Orders for customer ${customerName} fetched successfully`,
      count: orders.length,
      orders: orders,
    });
  } catch (err)
  {
    console.error("Error in getByCustomer:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while searching orders",
    });
  }
};


export const getByUserEmail = async (req, res) =>
{
  try
  {
    const { email } = req.params;

    const orders = await Order.find({
      userEmail: { $regex: email, $options: "i" },
    }).sort({ createdAt: -1 });

    if (!orders || orders.length === 0)
    {
      return res.status(404).json({
        success: false,
        message: `No orders found for user: ${email}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Orders for user ${email} fetched successfully`,
      count: orders.length,
      orders,
    });
  } catch (err)
  {
    console.error("Error in getByUserEmail:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
    });
  }
};