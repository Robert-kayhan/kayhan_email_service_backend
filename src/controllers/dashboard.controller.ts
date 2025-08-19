import { Request, Response } from "express";
import LeadFollowUp from "../models/LeadFolowUp";
import { Op, fn, col } from "sequelize";

const getLeadsDashboardStats = async (req: Request, res: Response) => {
  try {
    const { userId = "all", timeRange = "today" } = req.query;

    const whereCreated: any = {};   // for totalLeads
    const whereSale: any = {};      // for sale stats

    // ✅ Filter by user
    if (userId !== "all") {
      whereCreated.createdBy = userId;
      whereSale.createdBy = userId;
    }

    const now = new Date();

    // ✅ Date filter for createdAt (total leads)
    const createdFilter: any = {};
    const saleFilter: any = {};

    if (timeRange === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      createdFilter[Op.gte] = start;
      saleFilter[Op.gte] = start;
    } else if (timeRange === "yesterday") {
      const start = new Date();
      start.setDate(now.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      createdFilter[Op.between] = [start, end];
      saleFilter[Op.between] = [start, end];
    } else if (timeRange === "month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      createdFilter[Op.gte] = start;
      saleFilter[Op.gte] = start;
    } else if (timeRange === "last_month") {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      createdFilter[Op.between] = [start, end];
      saleFilter[Op.between] = [start, end];
    }

    whereCreated.createdAt = createdFilter;
    whereSale.saleStatusUpdatedAt = saleFilter;

    // ✅ Total leads (by createdAt)
    const totalLeads = await LeadFollowUp.count({ where: whereCreated });

    // ✅ Sales Done (by saleStatusUpdatedAt)
    const salesDone = await LeadFollowUp.count({
      where: {
        ...whereSale,
        [Op.or]: [
          { saleStatus: "Sale done" },
          { firstFollowUpType: "Sale done" },
          { secondFollowUpType: "Sale done" },
          { thirdFollowUpType: "Sale done" },
          { finalFollowUpType: "Sale done" },
        ],
      },
    });

    // ✅ Sales Not Done (by saleStatusUpdatedAt)
    const salesNotDone = await LeadFollowUp.count({
      where: {
        ...whereSale,
        [Op.or]: [
          { saleStatus: "Sale not done" },
          { firstFollowUpType: "Sale not done" },
          { secondFollowUpType: "Sale not done" },
          { thirdFollowUpType: "Sale not done" },
          { finalFollowUpType: "Sale not done" },
        ],
      },
    });

    // ✅ Quotations (by saleStatusUpdatedAt)
    const quotations = await LeadFollowUp.count({
      where: {
        ...whereSale,
        [Op.or]: [
          { saleStatus: "Quotation" },
          { firstFollowUpType: "Quotation" },
          { secondFollowUpType: "Quotation" },
          { thirdFollowUpType: "Quotation" },
          { finalFollowUpType: "Quotation" },
        ],
      },
    });

    // ✅ Progress %
    const leadProgress = totalLeads > 0 ? Math.round((salesDone / totalLeads) * 100) : 0;

    // ✅ Leads grouped by source (based on createdAt only)
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
