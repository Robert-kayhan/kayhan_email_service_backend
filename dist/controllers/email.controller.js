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
exports.handleUnsubscribe = exports.checkUserOpenEmail = exports.sendEmails = void 0;
const Campaign_1 = __importDefault(require("../models/Campaign"));
const EmailLog_1 = __importDefault(require("../models/EmailLog"));
const LeadGroupAssignment_1 = __importDefault(require("../models/LeadGroupAssignment"));
const User_model_1 = __importDefault(require("../models/User.model"));
const Template_1 = __importDefault(require("../models/Template"));
const sendEmail_1 = require("../utils/sendEmail");
const uuid_1 = require("uuid");
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
            .filter((user) => user && user.email && user.isSubscribed);
        if (!usersToEmail.length) {
            res
                .status(400)
                .json({ message: "No users with emails found in lead group" });
        }
        // 3. Send emails and log results
        const logs = [];
        for (const user of usersToEmail) {
            try {
                // 1. Generate unsubscribe token if not present
                if (!user.unsubscribeToken) {
                    user.unsubscribeToken = (0, uuid_1.v4)();
                    yield user.save();
                }
                // 2. Create log first so you can use log.id in tracking pixel
                const log = yield EmailLog_1.default.create({
                    campaign_id: campaign.id,
                    email: user.email,
                    status: "pending", // temporary status, will update later
                });
                // 3. Prepare email content
                const unsubscribeLink = `https://mailerapi.kayhanaudio.com.au/api/send-email/unsubscribe/?token=${user.unsubscribeToken}`;
                const pixelUrl = `https://mailerapi.kayhanaudio.com.au/api/send-email/open/?emailId=${log.id}`;
                const subject = campaign.campaignName;
                let html = ((_a = campaign.Template) === null || _a === void 0 ? void 0 : _a.html) || "<p>No template</p>";
                const text = "You have a new campaign message.";
                // 4. Append unsubscribe link + tracking pixel
                html += `
            <hr />
            <p style="font-size: 12px; color: #888;">
              Don’t want these emails?
              <a href="${unsubscribeLink}">Unsubscribe here</a>.
            </p>
            <img 
              src="${pixelUrl}" 
              width="1" 
              height="1" 
              style="display: none;" 
              alt="tracking-pixel"
            />
          `;
                console.log("📧 Sending to:", user.email);
                // 5. Send the email
                const result = yield (0, sendEmail_1.sendEmail)({
                    to: user.email,
                    subject,
                    bodyHtml: html,
                    bodyText: text,
                    from: "noreply@mailer.kayhanaudio.com.au",
                });
                console.log("✅ Email sent:", result);
                // 6. Update log to sent
                yield log.update({ status: "sent" });
                logs.push(log);
            }
            catch (err) {
                console.error("❌ Failed to send to", user.email, err);
                // Fallback: create log only if it failed before log was created
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
const checkUserOpenEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { campaignId, email } = req.params;
    try {
        yield EmailLog_1.default.update({ opened: true, openedAt: new Date() }, { where: { campaign_id: campaignId, email } });
    }
    catch (error) {
        console.log("error message", error);
    }
});
exports.checkUserOpenEmail = checkUserOpenEmail;
const handleUnsubscribe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.body;
    const user = yield User_model_1.default.findOne({ where: { unsubscribeToken: token } });
    if (!user) {
        res.status(404).json({ message: "Invalid unsubscribe token" });
        return;
    }
    user.isSubscribed = false;
    yield user.save();
    res.json({ message: "Successfully unsubscribed." });
});
exports.handleUnsubscribe = handleUnsubscribe;
