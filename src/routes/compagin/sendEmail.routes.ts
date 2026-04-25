import express from "express";
import {
  sendEmails,
  checkUserOpenEmail,
  handleUnsubscribe,
  sendEmailForTesting,
  trackClick
} from "../../controllers/compagin/email.controller";
const router = express.Router();
router.route("/send-test").post(sendEmailForTesting);
router.route("/:campaignId").post(sendEmails);
router.route("/unsubscribe").get(handleUnsubscribe);
router.route("/open").get(checkUserOpenEmail);
router.get("/click", trackClick);

export default router;
