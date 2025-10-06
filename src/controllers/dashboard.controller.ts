import { Request, Response } from "express";

import { Op, fn, col } from "sequelize";
import LeadFollowUp from "../models/crm/LeadFolowUp";
import LeadSalesTracking from "../models/crm/LeadSalesTracking";

const getLeadsDashboardStats = async (req: Request, res: Response) => {
  try {
    const { userId = "all", timeRange = "today" } = req.query;

    const whereCreated: any = {}; // For total leads
    const whereTracking: any = {}; // For sales/quotations/invoices

    // Filter by user
    if (userId !== "all") {
      whereCreated.createdBy = userId;
      whereTracking.userId = userId;
    }

    const now = new Date();
    const createdFilter: any = {};
    const trackingFilter: any = {};

    if (timeRange === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      createdFilter[Op.gte] = start;
      trackingFilter[Op.gte] = start;
    } else if (timeRange === "yesterday") {
      const start = new Date();
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      createdFilter[Op.between] = [start, end];
      trackingFilter[Op.between] = [start, end];
    } else if (timeRange === "this_week") {
      const start = new Date();
      const day = start.getDay(); // Sunday = 0
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      createdFilter[Op.between] = [start, end];
      trackingFilter[Op.between] = [start, end];
    } else if (timeRange === "month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      createdFilter[Op.gte] = start;
      trackingFilter[Op.gte] = start;
    } else if (timeRange === "last_month") {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      end.setHours(23, 59, 59, 999);
      createdFilter[Op.between] = [start, end];
      trackingFilter[Op.between] = [start, end];
    } else if (timeRange === "this_year") {
      const start = new Date(now.getFullYear(), 0, 1);
      createdFilter[Op.gte] = start;
      trackingFilter[Op.gte] = start;
    } else if (timeRange === "last_year") {
      const start = new Date(now.getFullYear() - 1, 0, 1);
      const end = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      createdFilter[Op.between] = [start, end];
      trackingFilter[Op.between] = [start, end];
    }

    whereCreated.createdAt = createdFilter;
    whereTracking.sale_status_update_date = trackingFilter;

    // Total leads
    const totalLeads = await LeadFollowUp.count({ where: whereCreated });

    // Sales done
    const salesDone = await LeadSalesTracking.count({
      where: { ...whereTracking, sale_status: "Sale done" },
    });

    // Sales not done
    const salesNotDone = await LeadSalesTracking.count({
      where: { ...whereTracking, sale_status: "Sale not done" },
    });

    // Quotations (only if no invoice created)
    const quotations = await LeadSalesTracking.count({
      where: { ...whereTracking, is_quotation: true, is_invoice: false },
    });

    // Invoices
    const invoices = await LeadSalesTracking.count({
      where: { ...whereTracking, is_invoice: true },
    });

    // Lead progress %
    const leadProgress =
      totalLeads > 0 ? Math.round((salesDone / totalLeads) * 100) : 0;

    // Channels grouped by leadSource
    const channels = await LeadFollowUp.findAll({
      where: whereCreated,
      attributes: ["leadSource", [fn("COUNT", col("leadSource")), "count"]],
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
          invoices,
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
