import express from "express";
import {createUser, Sign , getMe } from "../controllers/auth.controller";
const router = express.Router();

router.route("/").get(getMe).post(createUser);
router.route("/sign-in").post(Sign);
export default router;
