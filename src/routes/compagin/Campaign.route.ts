import express from "express";
import {
  createCampaign,
  deleteCampaign,
  updateCampaign,
  getAllCampaigns,
  getCampaignById,
} from "../../controllers/compagin/Campaign.controller";

const router = express.Router();

router.route("/").post(createCampaign).get(getAllCampaigns);
router
  .route("/:id")
  .get(getCampaignById)
  .put(updateCampaign)
  .delete(deleteCampaign);
export default router;
