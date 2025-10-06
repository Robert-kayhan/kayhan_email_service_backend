import express from "express";
import {
  createOneUser,
  createMultipleUser,
  getALLUser,
  deleteUser,
  updateUser,
  getUsersWithLeadStatus,
  createAllWholesaleUsers
} from "../../controllers/user/user.controller";
import { uploadExcel } from "../../middlewares/Upload";
import protect from "../../middlewares/auth.middleware";
const router = express.Router();

router.route("/").post( createOneUser).get(getALLUser);
router.route("/upload-excel").post(uploadExcel.single("file"), createMultipleUser);
router.route("/user/:id").delete(deleteUser).put(updateUser);
router.route("/lead-user").get(getUsersWithLeadStatus)
router.route("/create-user").get(createAllWholesaleUsers)
export default router;
