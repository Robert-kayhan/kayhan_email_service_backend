import express from "express";
import {
  sendEmails,
  checkUserOpenEmail,
  handleUnsubscribe,
} from "../controllers/email.controller";
const router = express.Router();

router.route("/:campaignId").post(sendEmails);
router.route("/unsubscribe").post(handleUnsubscribe);
router.route("/open").post(checkUserOpenEmail);

export default router;
