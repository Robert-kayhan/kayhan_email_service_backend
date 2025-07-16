"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const leadGroup_controller_1 = require("../controllers/leadGroup.controller");
const router = express_1.default.Router();
router.route("/").post(leadGroup_controller_1.createLeadGroupWithUsers).get(leadGroup_controller_1.getAllLeadGroupsWithUsers);
router
    .route("/:id")
    .get(leadGroup_controller_1.getAllLeadGroupsWithID)
    .put(leadGroup_controller_1.updateLeadGroupWithUsers)
    .delete(leadGroup_controller_1.deleteLeadGroupById);
exports.default = router;
