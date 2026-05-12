// utils/dateFilter.ts
import { Op } from "sequelize";

export const buildDateFilter = (query: any) => {
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