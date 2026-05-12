import { Request, Response } from "express";
import { Op } from "sequelize";
import TrafficSource from "../../models/crm/TrafficSource";
import PageVisit from "../../models/crm/PageVisit";


// ✅ GET REAL IP
const getIP = (req: Request) => {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
    req.socket.remoteAddress ||
    req.ip ||
    "unknown"
  );
};


// 🔥 COMMON DATE FILTER
const buildDateFilter = (query: any) => {
  const { range, fromDate, toDate } = query;
  const now = new Date();

  let where: any = {};

  if (range === "today") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    where.createdAt = { [Op.gte]: start };
  }

  else if (range === "yesterday") {
    const start = new Date();
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    where.createdAt = { [Op.between]: [start, end] };
  }

  else if (range === "last7days") {
    const start = new Date();
    start.setDate(start.getDate() - 7);
    where.createdAt = { [Op.gte]: start };
  }

  else if (range === "thisMonth") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    where.createdAt = { [Op.gte]: start };
  }

  else if (range === "lastMonth") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    where.createdAt = { [Op.between]: [start, end] };
  }

  else if (range === "thisYear") {
    const start = new Date(now.getFullYear(), 0, 1);
    where.createdAt = { [Op.gte]: start };
  }

  else if (range === "lastYear") {
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



// ✅ TRACK UTM VISITOR (FIRST VISIT)
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
    const ip = getIP(req);

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
      ip_address: ip,
      user_agent: req.headers["user-agent"],
    });

    res.status(200).json({ success: true, data });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};



// 🔥 TRACK EVERY PAGE VISIT
export const trackPageVisit = async (req: Request, res: Response) => {
  try {
    const ip = getIP(req);

    await PageVisit.create({
      ip_address: ip,
      user_agent: req.headers["user-agent"],
      url: req.body.url,
      path: req.body.path,
    });

    res.status(200).json({ success: true });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};



// ✅ GET ALL TRAFFIC
export const getAllTraffic = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
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



// ✅ TRAFFIC SOURCE STATS
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



// ✅ CAMPAIGN STATS
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



// 🔥 UNIQUE USERS (DISTINCT IP)
export const getUniqueUsers = async (req: Request, res: Response) => {
  try {
    const where = buildDateFilter(req.query);

    const result: any = await PageVisit.findAll({
      where,
      attributes: [
        [
          PageVisit.sequelize!.fn(
            "COUNT",
            PageVisit.sequelize!.fn("DISTINCT", PageVisit.sequelize!.col("ip_address"))
          ),
          "total_users",
        ],
      ],
      raw: true,
    });

    res.status(200).json({
      total_users: Number(result[0]?.total_users || 0),
    });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};



// 🔥 IP STATS (WITH FILTER)
export const getIPStats = async (req: Request, res: Response) => {
  try {
    const where = buildDateFilter(req.query);

    const data = await PageVisit.findAll({
      where,
      attributes: [
        "ip_address",
        [
          PageVisit.sequelize!.fn("COUNT", PageVisit.sequelize!.col("id")),
          "pages_visited",
        ],
      ],
      group: ["ip_address"],
      order: [[PageVisit.sequelize!.literal("pages_visited"), "DESC"]],
    });

    res.status(200).json(data);

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};



// 🔥 USER JOURNEY (BY IP)
export const getUserJourney = async (req: Request, res: Response) => {
  try {
    const { ip } = req.query;

    if (!ip) {
      res.status(400).json({ error: "IP is required" });
      return;
    }

    const pages = await PageVisit.findAll({
      where: { ip_address: ip },
      order: [["createdAt", "ASC"]],
    });

    res.status(200).json({
      total_pages: pages.length,
      journey: pages,
    });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// 🔥 DASHBOARD STATS (TODAY)
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // ✅ Total visits today
    const totalVisits = await PageVisit.count({
      where: {
        createdAt: { [Op.gte]: todayStart },
      },
    });

    // ✅ Unique users today (distinct IP)
    const uniqueUsers = await PageVisit.count({
      distinct: true,
      col: "ip_address",
      where: {
        createdAt: { [Op.gte]: todayStart },
      },
    });

    res.status(200).json({
      totalVisits,
      uniqueUsers,
    });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};