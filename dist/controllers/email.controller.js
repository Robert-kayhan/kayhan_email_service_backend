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
exports.sendEmails = void 0;
const Campaign_1 = __importDefault(require("../models/Campaign"));
const EmailLog_1 = __importDefault(require("../models/EmailLog"));
const LeadGroupAssignment_1 = __importDefault(require("../models/LeadGroupAssignment"));
const User_model_1 = __importDefault(require("../models/User.model"));
const Template_1 = __importDefault(require("../models/Template"));
const sendEmail_1 = require("../utils/sendEmail");
const sendEmails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { campaignId } = req.params;
    try {
        // 1. Get Campaign
        const campaign = yield Campaign_1.default.findByPk(campaignId, {
            include: [
                { model: Template_1.default, as: "Template" },
                { model: EmailLog_1.default, as: "EmailLogs" },
            ],
        });
        if (!campaign) {
            res.status(404).json({ message: "Campaign not found" });
        }
        // 2. Get users from lead group
        const leadAssignments = yield LeadGroupAssignment_1.default.findAll({
            where: { groupId: campaign.leadGroupId },
            include: [{ model: User_model_1.default, as: "User" }],
        });
        const usersToEmail = leadAssignments
            .map((assign) => assign.User)
            .filter((user) => user && user.email);
        if (!usersToEmail.length) {
            res
                .status(400)
                .json({ message: "No users with emails found in lead group" });
        }
        // 3. Send emails and log results
        const logs = [];
        for (const user of usersToEmail) {
            try {
                const subject = campaign.campaignName;
                const html = ((_a = campaign.Template) === null || _a === void 0 ? void 0 : _a.html) || "<p>No template</p>";
                const text = "You have a new campaign message.";
                yield (0, sendEmail_1.sendEmail)({
                    to: user.email,
                    // to: "mailer@kayhanaudio.com.au",
                    subject,
                    bodyHtml: html,
                    bodyText: text,
                    // from: campaign.fromEmail,
                    from: "noreply@mailer.kayhanaudio.com.au",
                });
                const log = yield EmailLog_1.default.create({
                    campaign_id: campaign.id,
                    email: user.email,
                    status: "sent",
                });
                logs.push(log);
            }
            catch (err) {
                const log = yield EmailLog_1.default.create({
                    campaign_id: campaign.id,
                    email: user.email,
                    status: "failed",
                    errorMessage: err.message || "Unknown error",
                });
                logs.push(log);
            }
        }
        res.json({
            message: "Emails processed",
            results: {
                sent: logs.filter((l) => l.status === "sent").length,
                failed: logs.filter((l) => l.status === "failed").length,
                total: logs.length,
            },
        });
    }
    catch (error) {
        console.error("Send campaign error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.sendEmails = sendEmails;
