"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const Upload_1 = require("../middlewares/Upload");
const router = express_1.default.Router();
router.route("/").post(user_controller_1.createOneUser).get(user_controller_1.getALLUser);
router.route("/upload-excel").post(Upload_1.upload.single("file"), user_controller_1.createMultipleUser);
router.route("/user/:id").delete(user_controller_1.deleteUser).put(user_controller_1.updateUser);
router.route("/lead-user").get(user_controller_1.getUsersWithLeadStatus);
exports.default = router;
