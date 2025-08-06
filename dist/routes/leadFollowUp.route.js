"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const leadFolowUp_controller_1 = require("../controllers/leadFolowUp.controller");
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const router = express_1.default.Router();
router.post("/", auth_middleware_1.default, leadFolowUp_controller_1.createLead);
router.get("/", leadFolowUp_controller_1.getAllLeads);
router.get("/:id", leadFolowUp_controller_1.getLeadById);
router.put("/:id", leadFolowUp_controller_1.updateLead);
router.delete("/:id", leadFolowUp_controller_1.deleteLead);
router.put("/:id/follow-up/:stage", leadFolowUp_controller_1.updateFollowUpStage);
router.put("/update-sale-status/:id", leadFolowUp_controller_1.updateSaleStatus);
router.post("/notes/:id", leadFolowUp_controller_1.addNote);
router.get("/notes/:id", leadFolowUp_controller_1.getNotesByLeadId);
exports.default = router;
