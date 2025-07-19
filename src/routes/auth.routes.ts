import express from "express";
import {createUser, Sign , getMe,Logout } from "../controllers/auth.controller";
const router = express.Router();

router.route("/").get(getMe).post(createUser);
router.route("/sign-in").post(Sign);
router.route("/logout").post(Logout)
export default router;
