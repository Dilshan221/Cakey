import CustomOrder from "../../models/delivery/CustomOrderModel.js";

//   Create a new custom order
export const createCustomOrder = async (req, res) =>
{
  try
  {
    const orderData = req.body;

    // Convert releaseDate string -> Date object
    if (orderData.releaseDate && typeof orderData.releaseDate === "string")
    {
      orderData.releaseDate = new Date(orderData.releaseDate);
    }

    const order = new CustomOrder(orderData);
    const savedOrder = await order.save();

    res.status(201).json({
      success: true,
      message: "Custom cake order created successfully",
      data: savedOrder,
    });
  } catch (error)
  {
    console.error("Error creating custom order:", error);
    res.status(500).json({
      success: false,
      message: "Error creating custom order: " + error.message,
    });
  }
};

//   Get all custom orders
export const getAllCustomOrders = async (req, res) =>
{
  try
  {
    const { status } = req.query;
    const filter = {};

    if (status)
    {
      filter.status = status;
    }

    const orders = await CustomOrder.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error)
  {
    console.error("Error fetching custom orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching custom orders",
      error: error.message,
    });
  }
};

//    Get single custom order by ID
export const getCustomOrderById = async (req, res) =>
{
  try
  {
    const order = await CustomOrder.findById(req.params.id);

    if (!order)
    {
      return res.status(404).json({
        success: false,
        message: "Custom order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error)
  {
    console.error("Error fetching custom order:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching custom order",
      error: error.message,
    });
  }
};

//   Update custom order status
export const updateOrderStatus = async (req, res) =>
{
  try
  {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "accepted", "rejected"];
    if (!validStatuses.includes(status))
    {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    const order = await CustomOrder.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!order)
    {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, message: "Status updated", data: order });
  } catch (err)
  {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//    Get order statistics
export const getOrderStats = async (req, res) =>
{
  try
  {
    const stats = await CustomOrder.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$estimatedPrice" },
        },
      },
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
          totalRevenue: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error)
  {
    console.error("Error fetching order stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order statistics",
      error: error.message,
    });
  }
};

export const cancelOrder = async (req, res) =>
{
  try
  {
    const { id } = req.params;

    const order = await CustomOrder.findByIdAndDelete(id);
    if (!order)
    {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (err)
  {
    console.error("Error canceling order:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
