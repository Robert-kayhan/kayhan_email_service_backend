import express from "express";
import {
  createCampaign,
  deleteCampaign,
  updateCampaign,
  getAllCampaigns,
  getCampaignById,
  sendComaginUsingExel,
} from "../../controllers/compagin/Campaign.controller";
import { uploadExcel } from "../../middlewares/Upload";

const router = express.Router();

router.route("/").post(createCampaign).get(getAllCampaigns);
router.route("/send-using-exel").post(uploadExcel.single("file"),sendComaginUsingExel)
router
  .route("/:id")
  .get(getCampaignById)
  .put(updateCampaign)
  .delete(deleteCampaign);
export default router;
