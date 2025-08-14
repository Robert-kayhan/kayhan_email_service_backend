// controllers/dashboard.controller.ts
import { Request, Response } from "express";
import LeadFollowUp from "../models/LeadFolowUp"; // fixed spelling
import { Op, fn, col, literal } from "sequelize";

const getLeadsDashboardStats = async (req: Request, res: Response) => {
  try {
    const { userId = "all", timeRange = "today" } = req.query;
    const where: any = {};

    // Filter by user
    if (userId !== "all") {
      where.created_by = userId; // use your actual DB column name
    }

    // Date filter
    const now = new Date();
    if (timeRange === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      where.createdAt = { [Op.gte]: start };
    } else if (timeRange === "yesterday") {
      const start = new Date();
      start.setDate(now.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      where.createdAt = { [Op.between]: [start, end] };
    } else if (timeRange === "month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      where.createdAt = { [Op.gte]: start };
    } else if (timeRange === "last_month") {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      where.createdAt = { [Op.between]: [start, end] };
    }

    // Count stats
    const totalLeads = await LeadFollowUp.count({ where });

    const salesDone = await LeadFollowUp.count({
      where: { ...where, saleStatus: "Sale done" },
    });

    const salesNotDone = await LeadFollowUp.count({
      where: { ...where, saleStatus: "Sale not done" },
    });

    const quotations = await LeadFollowUp.count({
      where: { ...where, saleStatus: "Quotation" },
    });

    const leadProgress =
      totalLeads > 0 ? Math.round((salesDone / totalLeads) * 100) : 0;

    // Leads grouped by source
    const channels = await LeadFollowUp.findAll({
      where,
      attributes: [
        "leadSource",
        [fn("COUNT", col("leadSource")), "count"],
      ],
      group: ["leadSource"],
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalLeads,
          salesDone,
          salesNotDone,
          quotations,
          leadProgress,
        },
        channels: channels.map((c: any) => ({
          name: c.get("leadSource") || "Other",
          value: Number(c.get("count")),
        })),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export { getLeadsDashboardStats };
