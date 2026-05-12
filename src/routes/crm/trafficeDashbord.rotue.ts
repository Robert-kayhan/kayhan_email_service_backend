import express from "express";

import {
  getDashboardAnalytics,
  getHourlyTraffic,
  getTopPages,
  getTodaySources,
  getTopVisitors,
} from "../../controllers/crm/TrafficSouceDashbord.controller";

const router = express.Router();

// ==============================
// 🔥 DASHBOARD ROUTES
// ==============================

// ✅ Main dashboard (cards data)
router.get("/dashboard", getDashboardAnalytics);

// ✅ Line chart (hourly users)
router.get("/hourly", getHourlyTraffic);

// ✅ Top pages (table)
router.get("/top-pages", getTopPages);

// ✅ Traffic sources (bar chart)
router.get("/sources", getTodaySources);

// ✅ Top visitors (IP list)
router.get("/top-visitors", getTopVisitors);

export default router;