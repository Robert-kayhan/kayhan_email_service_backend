import { Router } from "express";

import {createJobReport , rescheduleJob , cancelJob ,getJobReportById} from "../../controllers/booking/JobReport.controller"
const router = Router();

// router.post("/notify", sendNotification);

router.post("/",createJobReport);
router.get("/:id",getJobReportById)
router.put("/:id",rescheduleJob);
router.put("/cancel/:id",cancelJob);


export default router;
