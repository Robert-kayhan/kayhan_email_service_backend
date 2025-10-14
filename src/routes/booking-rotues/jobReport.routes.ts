import { Router } from "express";

import {createJobReport , rescheduleJob , cancelJob ,getJobReportById, updateJobReport} from "../../controllers/booking/JobReport.controller"
import { timeApi } from "../../controllers/booking/JobReport.controller";

const router = Router();

// router.post("/notify", sendNotification);

router.post("/",createJobReport);
router.get("/:id",getJobReportById)
router.put("/:id",rescheduleJob);
router.put("/cancel/:id",cancelJob);
router.put("/job-report/:id", updateJobReport);
router.route("/:id/times").patch(timeApi)


export default router;
