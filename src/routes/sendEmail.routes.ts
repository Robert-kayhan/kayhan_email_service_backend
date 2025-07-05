import express from "express";
import { sendEmails } from "../controllers/email.controller";
const router = express.Router()

router.route("/:campaignId").post(sendEmails)


export default router;