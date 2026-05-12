import express, { Router } from "express";
import {
  trackVisitor,
  trackPageVisit,
  getAllTraffic,
  getTrafficStats,
  getCampaignStats,
  getUserJourney,
  getIPStats,
  getDashboardStats, // 🔥 NEW
} from "../../controllers/crm/TrafficSource.controller";

const router: Router = express.Router();


// =============================
// 🔹 TRACKING ROUTES
// =============================

// Track UTM (first visit)
router.post("/track", trackVisitor);

// Track every page visit
router.post("/page-visit", trackPageVisit);


// =============================
// 🔹 DATA ROUTES
// =============================

// Get all traffic (pagination + filters)
router.get("/", getAllTraffic);


// =============================
// 🔹 ANALYTICS ROUTES
// =============================

// Source stats
router.get("/stats/source", getTrafficStats);

// Campaign stats
router.get("/stats/campaign", getCampaignStats);

// 🔥 Dashboard stats (today users + visits)
router.get("/stats/dashboard", getDashboardStats);

// IP stats (visits per IP)
router.get("/ip-stats", getIPStats);

// User journey (by IP)
router.get("/journey", getUserJourney);


// =============================
// 🔹 OPTIONAL (FUTURE)
// =============================

// router.get("/search", searchTraffic);
// router.get("/:id", getTrafficById);
// router.delete("/:id", deleteTraffic);

export default router;