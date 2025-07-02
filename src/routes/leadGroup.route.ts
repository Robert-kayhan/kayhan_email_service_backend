import express from "express";
import {
  createLeadGroupWithUsers,
  getAllLeadGroupsWithUsers,
  getAllLeadGroupsWithID,
  updateLeadGroupWithUsers,
  deleteLeadGroupById
} from "../controllers/leadGroup.controller";

const router = express.Router();

router.route("/").post(createLeadGroupWithUsers).get(getAllLeadGroupsWithUsers);

router
  .route("/:id")
  .get(getAllLeadGroupsWithID)
  .put(updateLeadGroupWithUsers)
  .delete(deleteLeadGroupById);
export default router;
