import express, { Request, Response } from "express";
import { Op } from "sequelize";
import { Invoice } from "../../models/bookingSystem/Invoice";
import User from "../../models/User.model";

const router = express.Router();

/**
 * GET /api/invoices
 * Query params:
 *  - page (default 1)
 *  - limit (default 10)
 *  - search (optional: matches invoiceUrl or bookingStatus)
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "10", 10);
    const offset = (page - 1) * limit;
    const search = (req.query.search as string) || "";

    // base where for invoice table
    const where: any = {};
    const userWhere: any = {};

    if (search) {
      // search invoiceUrl, bookingStatus, bookingId
      where[Op.or] = [
        { invoiceUrl: { [Op.like]: `%${search}%` } },
        { bookingStatus: { [Op.like]: `%${search}%` } },
        { bookingId: { [Op.like]: `%${search}%` } },
      ];

      // search inside User association fields too
      userWhere[Op.or] = [
        { email: { [Op.like]: `%${search}%` } },
        { firstname: { [Op.like]: `%${search}%` } },
        { lastname: { [Op.like]: `%${search}%` } },
      ];
    }

    const { rows: invoices, count } = await Invoice.findAndCountAll({
      where,
      offset,
      limit,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "User",
          attributes: ["id", "firstname", "lastname", "email", "phone"],
          // add userWhere only if searching
          where: Object.keys(userWhere).length ? userWhere : undefined,
          required: false, // still return invoices without a user
        },
      ],
    });

    res.json({
      success: true,
      total: count,
      page,
      limit,
      invoices,
    });
  } catch (err) {
    console.error("❌ Error fetching invoices:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


/**
 * DELETE /api/invoices/:id
 * Deletes an invoice by its id
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findByPk(id);
    if (!invoice) {
       res.status(404).json({ success: false, message: "Invoice not found" });
       return
    }

    await invoice.destroy();
     res.json({ success: true, message: "Invoice deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting invoice:", err);
     res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
