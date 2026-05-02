import express, { Router } from "express";
import {
  trackVisitor,
  getAllTraffic,
 
  getTrafficStats,
  getCampaignStats,
} from "../../controllers/crm/TrafficSource.controller";

const router: Router = express.Router();

// 🔹 CREATE (track visitor)
router.post("/track", trackVisitor);

// 🔹 GET ALL (pagination)
router.get("/", getAllTraffic);

// 🔹 SEARCH / FILTER
// router.get("/search", searchTraffic);

// 🔹 ANALYTICS
router.get("/stats/source", getTrafficStats);
router.get("/stats/campaign", getCampaignStats);

// 🔹 GET SINGLE
// router.get("/:id", getTrafficById);

// 🔹 DELETE
// router.delete("/:id", deleteTraffic);

export default router;