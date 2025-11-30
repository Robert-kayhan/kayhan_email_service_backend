import express from "express";
import {
  createReport,
  getAllTechRepair,
  findReportById,
  updateReportById,
  deletetechRepairById,
} from "../../controllers/repair-return/tech-report-request.controller";
const router = express.Router();

router.route("/").post(createReport).get(getAllTechRepair);
router
  .route("/:id")
  .get(findReportById)
  .put(updateReportById)
  .delete(deletetechRepairById);

export default router;
