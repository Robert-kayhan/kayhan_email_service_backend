import { Request, Response } from "express";
import { Op } from "sequelize";
import TrafficSource from "../../models/crm/TrafficSource";
import PageVisit from "../../models/crm/PageVisit";

// ==============================
// 🔥 COMMON DATE FILTER
// ==============================
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

  else if (range === "thisWeek") {
    const start = new Date();
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0, 0, 0, 0);
    where.createdAt = { [Op.gte]: start };
  }

  else if (range === "lastWeek") {
    const start = new Date();
    start.setDate(start.getDate() - start.getDay() - 7);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    where.createdAt = { [Op.between]: [start, end] };
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

  if (range === "custom" && fromDate && toDate) {
    where.createdAt = {
      [Op.between]: [new Date(fromDate), new Date(toDate)],
    };
  }

  return where;
};



// ==============================
// 🔥 DASHBOARD ANALYTICS
// ==============================
export const getDashboardAnalytics = async (req: Request, res: Response) => {
  try {
    const where = buildDateFilter(req.query);

    const totalVisits = await PageVisit.count({ where });

    const uniqueUsers = await PageVisit.count({
      distinct: true,
      col: "ip_address",
      where,
    });

    const topSource: any = await TrafficSource.findAll({
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
      limit: 1,
    });

    const topPage: any = await PageVisit.findAll({
      where,
      attributes: [
        "path",
        [
          PageVisit.sequelize!.fn("COUNT", PageVisit.sequelize!.col("id")),
          "visits",
        ],
      ],
      group: ["path"],
      order: [[PageVisit.sequelize!.literal("visits"), "DESC"]],
      limit: 1,
    });

    res.json({
      totalVisits,
      uniqueUsers,
      topSource: topSource[0]?.utm_source || "N/A",
      topPage: topPage[0]?.path || "N/A",
    });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};



// ==============================
// 🔥 HOURLY TRAFFIC
// ==============================
export const getHourlyTraffic = async (req: Request, res: Response) => {
  try {
    const where = buildDateFilter(req.query);

    const data = await PageVisit.findAll({
      where,
      attributes: [
        [
          PageVisit.sequelize!.fn(
            "DATE_FORMAT",
            PageVisit.sequelize!.col("createdAt"),
            "%H:00"
          ),
          "hour",
        ],
        [
          PageVisit.sequelize!.fn("COUNT", PageVisit.sequelize!.col("id")),
          "visits",
        ],
      ],
      group: ["hour"],
      order: [["hour", "ASC"]],
      raw: true,
    });

    res.json(data);

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};



// ==============================
// 🔥 TOP PAGES
// ==============================
export const getTopPages = async (req: Request, res: Response) => {
  try {
    const where = buildDateFilter(req.query);

    const data = await PageVisit.findAll({
      where,
      attributes: [
        "path",
        [
          PageVisit.sequelize!.fn("COUNT", PageVisit.sequelize!.col("id")),
          "visits",
        ],
      ],
      group: ["path"],
      order: [[PageVisit.sequelize!.literal("visits"), "DESC"]],
      limit: 10,
    });

    res.json(data);

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};



// ==============================
// 🔥 SOURCES
// ==============================
export const getTodaySources = async (req: Request, res: Response) => {
  try {
    const where = buildDateFilter(req.query);

    const data = await TrafficSource.findAll({
      where,
      attributes: [
        "utm_source",
        [
          TrafficSource.sequelize!.fn("COUNT", TrafficSource.sequelize!.col("id")),
          "visits",
        ],
      ],
      group: ["utm_source"],
      order: [[TrafficSource.sequelize!.literal("visits"), "DESC"]],
    });

    res.json(data);

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};



// ==============================
// 🔥 TOP VISITORS (IP)
// ==============================
export const getTopVisitors = async (req: Request, res: Response) => {
  try {
    const where = buildDateFilter(req.query);

    const data = await PageVisit.findAll({
      where,
      attributes: [
        "ip_address",
        [
          PageVisit.sequelize!.fn("COUNT", PageVisit.sequelize!.col("id")),
          "visits",
        ],
      ],
      group: ["ip_address"],
      order: [[PageVisit.sequelize!.literal("visits"), "DESC"]],
      limit: 10,
    });

    res.json(data);

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};