import express from "express";
import {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
  updateFollowUpStage,
  updateSaleStatus,
  addNote,
  getNotesByLeadId,
  checkEmail
} from "../../controllers/crm/leadFolowUp.controller";
// import protect from "../middlewares/auth.middleware";
const router = express.Router();

router.post("/", createLead);
router.get("/", getAllLeads);
router.get("/:id", getLeadById);
router.put("/:id", updateLead);
router.delete("/:id", deleteLead);
router.put("/:id/follow-up/:stage", updateFollowUpStage);
router.put("/update-sale-status/:id" ,updateSaleStatus)
router.post("/notes/:id", addNote);
router.get("/notes/:id", getNotesByLeadId);
router.get("/check-email/:email", checkEmail);

export default router;
