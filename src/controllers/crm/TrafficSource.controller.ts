import { Request, Response } from "express";
import { Op } from "sequelize";
import TrafficSource from "../../models/crm/TrafficSource";


// 🔥 COMMON DATE FILTER FUNCTION
const buildDateFilter = (query: any) => {
  const { range, fromDate, toDate } = query;
  const now = new Date();

  let where: any = {};

  if (range === "today") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    where.createdAt = { [Op.gte]: start };
  }

  if (range === "yesterday") {
    const start = new Date();
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    where.createdAt = { [Op.between]: [start, end] };
  }

  if (range === "last7days") {
    const start = new Date();
    start.setDate(start.getDate() - 7);
    where.createdAt = { [Op.gte]: start };
  }

  if (range === "thisMonth") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    where.createdAt = { [Op.gte]: start };
  }

  if (range === "lastMonth") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    where.createdAt = { [Op.between]: [start, end] };
  }

  if (range === "thisYear") {
    const start = new Date(now.getFullYear(), 0, 1);
    where.createdAt = { [Op.gte]: start };
  }

  if (range === "lastYear") {
    const start = new Date(now.getFullYear() - 1, 0, 1);
    const end = new Date(now.getFullYear() - 1, 11, 31);
    where.createdAt = { [Op.between]: [start, end] };
  }

  if (fromDate && toDate) {
    where.createdAt = {
      [Op.between]: [new Date(fromDate), new Date(toDate)],
    };
  }

  return where;
};



// ✅ CREATE
export const trackVisitor = async (req: Request, res: Response): Promise<void> => {
  try {
    let {
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
      landing_page,
    } = req.body;

    const referrer = req.headers.referer || null;

    if (!utm_source) {
      if (referrer?.includes("google")) utm_source = "organic";
      else if (referrer?.includes("facebook")) utm_source = "facebook";
      else utm_source = "direct";
    }

    const data = await TrafficSource.create({
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
      referrer,
      landing_page,
      ip_address: req.ip,
      user_agent: req.headers["user-agent"],
    });

    res.status(200).json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};



// ✅ GET ALL (WITH FILTER)
export const getAllTraffic = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const where = buildDateFilter(req.query);

    const { rows, count } = await TrafficSource.findAndCountAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};



// ✅ SOURCE STATS (FILTERED)
export const getTrafficStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const where = buildDateFilter(req.query);

    const data = await TrafficSource.findAll({
      where,
      attributes: [
        "utm_source",
        [
          TrafficSource.sequelize!.fn("COUNT", TrafficSource.sequelize!.col("id")),
          "count",
        ],
      ],
      group: ["utm_source"],
      order: [[TrafficSource.sequelize!.literal("count"), "DESC"]],
    });

    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};



// ✅ CAMPAIGN STATS (FILTERED)
export const getCampaignStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const where = buildDateFilter(req.query);

    const data = await TrafficSource.findAll({
      where,
      attributes: [
        "utm_campaign",
        [
          TrafficSource.sequelize!.fn("COUNT", TrafficSource.sequelize!.col("id")),
          "visits",
        ],
      ],
      group: ["utm_campaign"],
      order: [[TrafficSource.sequelize!.literal("visits"), "DESC"]],
    });

    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

