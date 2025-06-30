"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const template_controller_1 = require("../controllers/template.controller");
const router = express_1.default.Router();
router.route("/").post(template_controller_1.createTemplate).get(template_controller_1.getAllTemplates);
router
    .route("/:id")
    .get(template_controller_1.getTemplateById)
    .put(template_controller_1.updateTemplate)
    .delete(template_controller_1.deleteTemplate);
exports.default = router;
