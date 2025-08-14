import express from "express"
import { getLeadsDashboardStats } from "../controllers/dashboard.controller";
const router = express.Router()

router.route("/").get(getLeadsDashboardStats)

export default router;