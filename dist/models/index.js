"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAssociations = void 0;
const Campaign_1 = __importDefault(require("./Campaign"));
const EmailLog_1 = __importDefault(require("./EmailLog"));
const LeadFolowUp_1 = __importDefault(require("./LeadFolowUp"));
const LeadGroup_1 = __importDefault(require("./LeadGroup"));
const LeadGroupAssignment_1 = __importDefault(require("./LeadGroupAssignment"));
const Note_1 = __importDefault(require("./Note"));
const Template_1 = __importDefault(require("./Template"));
const User_model_1 = __importDefault(require("./User.model"));
const setupAssociations = () => {
    // LeadGroup → LeadGroupAssignment
    LeadGroup_1.default.hasMany(LeadGroupAssignment_1.default, {
        foreignKey: "groupId",
        as: "LeadGroupAssignments",
        constraints: false, // disable FK constraint generation
    });
    LeadGroupAssignment_1.default.belongsTo(LeadGroup_1.default, {
        foreignKey: "groupId",
        as: "Group",
        constraints: false,
    });
    // LeadGroupAssignment → User
    LeadGroupAssignment_1.default.belongsTo(User_model_1.default, {
        foreignKey: "userId",
        as: "User",
        constraints: false,
    });
    // Campaign → Template
    Campaign_1.default.belongsTo(Template_1.default, {
        foreignKey: "templateId",
        as: "Template",
        constraints: false,
    });
    // Campaign → LeadGroup
    Campaign_1.default.belongsTo(LeadGroup_1.default, {
        foreignKey: "leadGroupId",
        as: "LeadGroup",
        constraints: false,
    });
    // Campaign → EmailLog
    Campaign_1.default.hasMany(EmailLog_1.default, {
        foreignKey: "campaign_id",
        as: "EmailLogs",
        constraints: false,
    });
    EmailLog_1.default.belongsTo(Campaign_1.default, {
        foreignKey: "campaign_id",
        as: "Campaign",
        constraints: false,
    });
};
exports.setupAssociations = setupAssociations;
LeadFolowUp_1.default.hasMany(Note_1.default, {
    foreignKey: "leadFollowUpId",
    as: "Notes",
    onDelete: "CASCADE",
    constraints: false,
});
Note_1.default.belongsTo(LeadFolowUp_1.default, {
    foreignKey: "leadFollowUpId",
    as: "LeadFollowUp",
    constraints: false,
});
