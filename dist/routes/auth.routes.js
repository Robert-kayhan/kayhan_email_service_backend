"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const router = express_1.default.Router();
router.route("/").get(auth_controller_1.getMe).post(auth_controller_1.createUser);
router.route("/sign-in").post(auth_controller_1.Sign);
router.route("/logout").post(auth_controller_1.Logout);
exports.default = router;
