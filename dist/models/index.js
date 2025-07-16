"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAssociations = void 0;
// models/associations.ts
const Campaign_1 = __importDefault(require("./Campaign"));
const EmailLog_1 = __importDefault(require("./EmailLog"));
const LeadGroup_1 = __importDefault(require("./LeadGroup"));
const LeadGroupAssignment_1 = __importDefault(require("./LeadGroupAssignment"));
const Template_1 = __importDefault(require("./Template"));
const User_model_1 = __importDefault(require("./User.model"));
const setupAssociations = () => {
    // LeadGroup → LeadGroupAssignment → User
    LeadGroup_1.default.hasMany(LeadGroupAssignment_1.default, {
        foreignKey: "groupId",
        as: "LeadGroupAssignments",
    });
    LeadGroupAssignment_1.default.belongsTo(LeadGroup_1.default, {
        foreignKey: "groupId",
        as: "Group",
    });
    LeadGroupAssignment_1.default.belongsTo(User_model_1.default, {
        foreignKey: "userId",
        as: "User",
    });
    // Campaign → Template
    Campaign_1.default.belongsTo(Template_1.default, { foreignKey: "templateId", as: "Template" });
    // Campaign → LeadGroup
    Campaign_1.default.belongsTo(LeadGroup_1.default, { foreignKey: "leadGroupId", as: "LeadGroup" });
    // ✅ Campaign → EmailLog
    Campaign_1.default.hasMany(EmailLog_1.default, {
        foreignKey: "campaign_id",
        as: "EmailLogs",
    });
    EmailLog_1.default.belongsTo(Campaign_1.default, {
        foreignKey: "campaign_id",
        as: "Campaign",
    });
};
exports.setupAssociations = setupAssociations;
