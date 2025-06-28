import express from "express";
import { createOneUser , createMultipleUser } from "../controllers/user.controler";
import { upload } from "../middlewares/Upload";
const router = express.Router()

router.route("/").post(createOneUser)
router.route("/upload-excel").post(upload.single("file"),createMultipleUser)
export default router