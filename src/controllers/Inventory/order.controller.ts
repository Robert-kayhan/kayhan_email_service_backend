// controllers/orderController.ts
import { Request, Response } from "express";
import Order from "../../models/Inventory/Order";
import Product from "../../models/Inventory/Product";
// -------------------- CREATE ORDER --------------------
const createOrder = async (req: Request, res: Response) => {
  try {
    const { channel_id, products, total_amount, paid_amount, status } = req.body;

    if (!channel_id || !products || !Array.isArray(products) || products.length === 0) {
       res.status(400).json({ success: false, message: "Invalid order data" });
       return
    }

    // --- Update product stock ---
    for (const item of products) {
      const { sku, quantity } = item;
      const product = await Product.findOne({ where: { sku_number: sku } });

      if (!product) {
         res.status(404).json({ success: false, message: `Product with SKU ${sku} not found` });
         return
      }

      // Decrease stock but don't allow negative values
      const newStock = product.stock - quantity;
      await Product.update(
        { stock: newStock >= 0 ? newStock : 0 },
        { where: { id: product.id } }
      );
    }

    // --- Create the order ---
    const order = await Order.create({
      channel_id,
      products,
      total_amount: total_amount || 0,
      paid_amount: paid_amount || 0,
      status: status || "pending",
    });

    res.status(201).json({ success: true, data: order });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create order", error });
  }
};

// -------------------- GET ALL ORDERS --------------------
const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.findAll({
      include: ["Channel"], // include channel info
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch orders", error });
  }
};

// -------------------- GET SINGLE ORDER --------------------
const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: ["Channel"],
    });

    if (!order) {
       res
        .status(404)
        .json({ success: false, message: "Order not found" });
        return
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch order", error });
  }
};

// -------------------- UPDATE ORDER --------------------
const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { channel_id, products, total_amount, paid_amount, status } =
      req.body;

    const order = await Order.findByPk(id);
    if (!order) {
       res
        .status(404)
        .json({ success: false, message: "Order not found" });
        return
    }

    await order.update({
      channel_id: channel_id ?? order.channel_id,
      products: products ?? order.products,
      total_amount: total_amount ?? order.total_amount,
      paid_amount: paid_amount ?? order.paid_amount,
      status: status ?? order.status,
    });

    res.json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update order", error });
  }
};

// -------------------- DELETE ORDER --------------------
const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id);
    if (!order) {
       res
        .status(404)
        .json({ success: false, message: "Order not found" });
        return
    }

    await order.destroy();
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete order", error });
  }
};

export { createOrder, deleteOrder, updateOrder, getOrderById, getOrders };
