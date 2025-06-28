import express from "express";
import {
  createOneUser,
  createMultipleUser,
  getALLUser,
  deleteUser,
  updateUser,
} from "../controllers/user.controler";
import { upload } from "../middlewares/Upload";
const router = express.Router();

router.route("/").post(createOneUser).get(getALLUser);
router.route("/upload-excel").post(upload.single("file"), createMultipleUser);
router.route("/user/:id").delete(deleteUser).put(updateUser);
export default router;
