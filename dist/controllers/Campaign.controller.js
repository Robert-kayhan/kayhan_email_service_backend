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
exports.getCampaignById = exports.getAllCampaigns = exports.updateCampaign = exports.deleteCampaign = exports.createCampaign = void 0;
const Campaign_1 = __importDefault(require("../models/Campaign"));
const Template_1 = __importDefault(require("../models/Template"));
const LeadGroup_1 = __importDefault(require("../models/LeadGroup"));
// CREATE Campaign
const createCampaign = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { campaignName, campaignSubject, fromEmail, senderName, templateId, leadGroupId } = req.body;
        if (!campaignName ||
            !fromEmail ||
            !senderName ||
            !templateId ||
            !leadGroupId ||
            !campaignSubject) {
            res.status(400).json({ message: "All fields are required." });
        }
        const template = yield Template_1.default.findByPk(templateId);
        if (!template) {
            res.status(404).json({ message: "Template not found." });
        }
        const leadGroup = yield LeadGroup_1.default.findByPk(leadGroupId);
        if (!leadGroup) {
            res.status(404).json({ message: "Lead group not found." });
        }
        const campaign = yield Campaign_1.default.create({
            campaignName,
            campaignSubject,
            fromEmail,
            senderName,
            templateId,
            leadGroupId,
        });
        res.status(201).json({
            message: "Campaign created successfully.",
            data: campaign,
        });
        return;
    }
    catch (error) {
        console.error("Error creating campaign:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});
exports.createCampaign = createCampaign;
// GET all campaigns
const getAllCampaigns = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Parse query params
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 25;
        const offset = (page - 1) * limit;
        // Fetch campaigns with pagination and associated models
        const { rows: campaigns, count: total } = yield Campaign_1.default.findAndCountAll({
            // include: [
            //   { model: Template, as: "Template" },
            //   { model: LeadGroup, as: "LeadGroup" },
            // ],
            order: [["createdAt", "DESC"]],
            limit,
            offset,
        });
        res.json({
            campaigns: campaigns,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    }
    catch (error) {
        console.error("Error fetching campaigns:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});
exports.getAllCampaigns = getAllCampaigns;
// GET single campaign by ID
const getCampaignById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const campaign = yield Campaign_1.default.findByPk(req.params.id, {
            include: [
                { model: Template_1.default, as: "Template" }, // ✅ Use alias
                { model: LeadGroup_1.default, as: "LeadGroup" }, // ✅ Use alias
            ],
        });
        if (!campaign) {
            res.status(404).json({ message: "Campaign not found." });
        }
        res.json({ data: campaign });
    }
    catch (error) {
        console.error("Error fetching campaign:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});
exports.getCampaignById = getCampaignById;
// UPDATE campaign
const updateCampaign = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const campaign = yield Campaign_1.default.findByPk(req.params.id);
        if (!campaign) {
            res.status(404).json({ message: "Campaign not found." });
            return;
        }
        const { campaignName, fromEmail, senderName, templateId, leadGroupId } = req.body;
        yield campaign.update({
            campaignName: campaignName !== null && campaignName !== void 0 ? campaignName : campaign.campaignName,
            fromEmail: fromEmail !== null && fromEmail !== void 0 ? fromEmail : campaign.fromEmail,
            senderName: senderName !== null && senderName !== void 0 ? senderName : campaign.senderName,
            templateId: templateId !== null && templateId !== void 0 ? templateId : campaign.templateId,
            leadGroupId: leadGroupId !== null && leadGroupId !== void 0 ? leadGroupId : campaign.leadGroupId,
        });
        res.json({
            message: "Campaign updated successfully.",
            data: campaign,
        });
    }
    catch (error) {
        console.error("Error updating campaign:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});
exports.updateCampaign = updateCampaign;
// DELETE campaign
const deleteCampaign = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const campaign = yield Campaign_1.default.findByPk(req.params.id);
        if (!campaign) {
            res.status(404).json({ message: "Campaign not found." });
            return;
        }
        yield campaign.destroy();
        res.json({ message: "Campaign deleted successfully." });
    }
    catch (error) {
        console.error("Error deleting campaign:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});
exports.deleteCampaign = deleteCampaign;
