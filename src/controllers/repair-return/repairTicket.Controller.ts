import { Request, Response } from "express";
import OrderProduct from "../../models/Repair-Portal/RepairProduct";

// -------------------- CREATE ORDER --------------------
export const createOrder = async (req: Request, res: Response) => {
  try {
    const {
      order_id,
      customer_id,
      customer_name,
      customer_email,
      customer_phone,
      billing_address,
      shipping_address,
      products,
      user_tracking_number,
      user_post_method,
    } = req.body;

    const newOrder = await OrderProduct.create({
      order_id,
      customer_id,
      customer_name,
      customer_email,
      customer_phone,
      billing_address,
      shipping_address,
      products,
      user_tracking_number,
      user_post_method,
    });
    console.log(req.body);
    res.status(201).json({ success: true });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------- GET ORDER LIST --------------------
export const getOrders = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = (req.query.search as string) || "";

    const offset = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.order_id = search; // simple search by order_id
    }

    const { count, rows } = await OrderProduct.findAndCountAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: {
        total: count,
        page,
        perPage: limit,
        result: rows,
      },
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------- GET ORDER DETAILS --------------------
export const getOrderDetail = async (req: Request, res: Response) => {
  console.log("api call");
  try {
    const orderId = req.params.id;
    console.log(orderId);
    const order = await OrderProduct.findOne({ where: { id: orderId } });

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, data: { result: order } });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------- UPDATE ORDER --------------------
export const updateOrder = async (req: Request, res: Response) => {
  console.log("api callsss");
  try {
    const orderId = req.params.id;
    const updateData = req.body;

    const order = await OrderProduct.findOne({ where: { id: orderId } });
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    await order.update(updateData);

    res.json({ success: true, data: order });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------- ADD NOTE --------------------
export const addNote = async (req: Request, res: Response) => {
  console.log("api function call", req.body);
  try {
    const orderId = req.params.id;
    const { text, by } = req.body;

    const order = await OrderProduct.findOne({ where: { id: orderId } });
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }

    const newNote = { text, createdAt: new Date(), by };
    const updatedNotes = [...(order.notes || []), newNote];

    await order.update({ notes: updatedNotes });

    res.json({ success: true, data: order });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const deleted = await OrderProduct.destroy({
      where: { id: req.params.id },
    });

    if (!deleted) {
       res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, message: "Order deleted successfully" });
  } catch (error: any) {
    console.error("Failed to delete order:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};