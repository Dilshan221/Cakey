import NormalOrderDashModel from "../../models/delivery/NormalOrderDashModel.js";

// Get dashboard statistics
export const getDashboardStats = async (req, res) =>
{
  try
  {
    const stats = await NormalOrderDashModel.getDashboardStats();
    return res.status(200).json({ stats });
  } catch (err)
  {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Error fetching dashboard statistics" });
  }
};

// Get recent orders
export const getRecentOrders = async (req, res) =>
{
  try
  {
    const orders = await NormalOrderDashModel.getRecentOrders(10);
    return res.status(200).json({ orders });
  } catch (err)
  {
    console.log(err);
    return res.status(500).json({ message: "Error fetching recent orders" });
  }
};

// Get all orders for dashboard table
export const getAllOrders = async (req, res) =>
{
  try
  {
    const orders = await NormalOrderDashModel.getOrdersForDashboard();
    return res.status(200).json({ orders });
  } catch (err)
  {
    console.log(err);
    return res.status(500).json({ message: "Error fetching orders" });
  }
};

// Get orders by status
export const getOrdersByStatus = async (req, res) =>
{
  const { status } = req.params;

  try
  {
    const orders = await NormalOrderDashModel.getOrdersByStatus(status);
    return res.status(200).json({ orders });
  } catch (err)
  {
    console.log(err);
    return res.status(500).json({ message: "Error fetching orders by status" });
  }
};

// Update order status
export const updateStatus = async (req, res) =>
{
  const { id } = req.params;
  const { status } = req.body;

  try
  {
    const updatedOrder = await NormalOrderDashModel.updateOrderStatus(
      id,
      status
    );
    return res.status(200).json({
      message: "Status updated successfully",
      order: updatedOrder,
    });
  } catch (err)
  {
    console.log(err);
    return res
      .status(500)
      .json({ message: err.message || "Error updating status" });
  }
};

// Cancel order
export const cancelOrder = async (req, res) =>
{
  const { id } = req.params;

  try
  {
    const cancelledOrder = await NormalOrderDashModel.cancelOrder(id);
    return res.status(200).json({
      message: "Order cancelled successfully",
      order: cancelledOrder,
    });
  } catch (err)
  {
    console.log(err);
    return res
      .status(500)
      .json({ message: err.message || "Error cancelling order" });
  }
};

// View invoice (placeholder - could generate actual invoice)
export const viewInvoice = async (req, res) =>
{
  const { id } = req.params;

  try
  {
    // In a real app, you might generate a PDF or return invoice data
    return res.status(200).json({
      message: `Invoice for order ${id}`,
      orderId: id,
      invoiceUrl: `/api/invoices/${id}`, // Placeholder URL
    });
  } catch (err)
  {
    console.log(err);
    return res.status(500).json({ message: "Error generating invoice" });
  }
};

// Get order analytics
export const getOrderAnalytics = async (req, res) =>
{
  try
  {
    const analytics = await NormalOrderDashModel.getOrderAnalytics();
    return res.status(200).json({ analytics });
  } catch (err)
  {
    console.log(err);
    return res.status(500).json({ message: "Error fetching analytics" });
  }
};
