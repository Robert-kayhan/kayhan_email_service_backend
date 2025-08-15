import express from "express";
import {
  createOneUser,
  createMultipleUser,
  getALLUser,
  deleteUser,
  updateUser,
  getUsersWithLeadStatus,
} from "../controllers/user.controller";
import { upload } from "../middlewares/Upload";
import protect from "../middlewares/auth.middleware";
const router = express.Router();

router.route("/").post( createOneUser).get(getALLUser);
router.route("/upload-excel").post(upload.single("file"), createMultipleUser);
router.route("/user/:id").delete(deleteUser).put(updateUser);
router.route("/lead-user").get(getUsersWithLeadStatus)
export default router;
