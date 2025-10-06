import express from "express";
import {
  sendEmails,
  checkUserOpenEmail,
  handleUnsubscribe,
} from "../../controllers/compagin/email.controller";
const router = express.Router();

router.route("/:campaignId").post(sendEmails);
router.route("/unsubscribe").get(handleUnsubscribe);
router.route("/open").get(checkUserOpenEmail);

export default router;
