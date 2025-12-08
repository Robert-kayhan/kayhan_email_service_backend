import { Request, Response } from "express";
import Order from "../../models/Inventory/Order";
import Product from "../../models/Inventory/Product";
import Channel from "../../models/Inventory/Channel";
import { sendEmail } from "../../utils/sendEmail";

const receiveOrder = async (req: Request, res: Response) => {
  try {
    const { channel_id, products, total_amount } = req.body;
    const jsonPayload = {
      channel_id,
      products,
      timestamp: new Date().toISOString(),
    };

    const bodyText = JSON.stringify(jsonPayload, null, 2);

    await sendEmail({
      to: "karandhiman9877@gmail.com", // change if needed
      subject: `JSON Product Payload - Channel ${channel_id}`,
      bodyHtml: `<pre>${bodyText}</pre>`, // HTML version
      bodyText, // plain text JSON
    });
    if (!channel_id || !products || !Array.isArray(products)) {
      res.status(400).json({ message: "Invalid request body" });
      return;
    }

    // To keep track of updated products
    const updatedProducts: any[] = [];

    for (const item of products) {
      const { sku, quantity } = item;

      // Find the product by channel and SKU
      const product = await Product.findOne({
        where: {
          channel_id,
          sku_number: sku,
        },
      });

      if (!product) {
        console.warn(`Product not found: ${sku}`);
        continue;
      }

      // Calculate new stock
      // const newStock = Math.max(0, product.stock - quantity);
      const newStock = product.stock - Number(quantity);


      // Update stock
      await product.update({ stock: newStock });

      updatedProducts.push({
        sku,
        oldStock: product.stock,
        newStock,
      });
    }
    await Order.create({
      channel_id: channel_id,
      products,
      total_amount: total_amount
    })
    res.status(200).json({
      message: "Stock updated successfully",
      updatedProducts,
    });
  } catch (error: any) {
    console.error("Error processing order:", error);
    res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};

const getAllOrder = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const { rows: orders, count } = await Order.findAndCountAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [{ model: Channel, as: "Channel" }],
    });

    res.status(200).json({
      success: true,
      currentPage: page,
      totalOrders: count,
      totalPages: Math.ceil(count / limit),
      orders,
    });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { receiveOrder, getAllOrder };
