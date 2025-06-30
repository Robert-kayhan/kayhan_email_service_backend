"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTemplate = exports.updateTemplate = exports.getTemplateById = exports.getAllTemplates = exports.createTemplate = void 0;
const Template_1 = __importDefault(require("../models/Template"));
// 🔹 Create a new template
const createTemplate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, design, html } = req.body;
        if (!name || !design || !html) {
            res.status(400).json({ message: "name, design, and html are required" });
            return;
        }
        // ✅ Check if template with the same name exists
        const existingTemplate = yield Template_1.default.findOne({ where: { name } });
        if (existingTemplate) {
            res.status(409).json({ message: "Template with this name already exists" });
            return;
        }
        // ✅ Create new template
        const template = yield Template_1.default.create({ name, design, html });
        res.status(201).json({
            message: "Template created successfully",
            data: template,
        });
    }
    catch (error) {
        console.error("Error creating template:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.createTemplate = createTemplate;
// 🔹 Get all templates
const getAllTemplates = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 👇 Get page and limit from query, with defaults
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { count, rows: templates } = yield Template_1.default.findAndCountAll({
            limit,
            offset,
            order: [["createdAt", "DESC"]], // optional: latest first
        });
        const totalPages = Math.ceil(count / limit);
        res.status(200).json({
            data: templates,
            meta: {
                totalItems: count,
                currentPage: page,
                totalPages,
                perPage: limit,
            },
        });
    }
    catch (error) {
        console.error("Error fetching templates:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getAllTemplates = getAllTemplates;
// 🔹 Get template by ID
const getTemplateById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const template = yield Template_1.default.findByPk(id);
        if (!template) {
            res.status(404).json({ message: "Template not found" });
        }
        res.status(200).json(template);
    }
    catch (error) {
        console.error("Error fetching template:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getTemplateById = getTemplateById;
// 🔹 Update a template
const updateTemplate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, design, html } = req.body;
        const template = yield Template_1.default.findByPk(id);
        if (!template) {
            res.status(404).json({ message: "Template not found" });
            return;
        }
        yield template.update({ name, design, html });
        res.status(200).json({
            message: "Template updated successfully",
            data: template,
        });
    }
    catch (error) {
        console.error("Error updating template:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.updateTemplate = updateTemplate;
// 🔹 Delete a template
const deleteTemplate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const template = yield Template_1.default.findByPk(id);
        if (!template) {
            res.status(404).json({ message: "Template not found" });
            return;
        }
        yield template.destroy();
        res.status(200).json({ message: "Template deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting template:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.deleteTemplate = deleteTemplate;
