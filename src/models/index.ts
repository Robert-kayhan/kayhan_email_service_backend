import Campaign from "./Campaign";
import EmailLog from "./EmailLog";
import LeadGroup from "./LeadGroup";
import LeadGroupAssignment from "./LeadGroupAssignment";
import Template from "./Template";
import User from "./User.model";

export const setupAssociations = () => {
  // LeadGroup → LeadGroupAssignment
  LeadGroup.hasMany(LeadGroupAssignment, {
    foreignKey: "groupId",
    as: "LeadGroupAssignments",
    constraints: false, // disable FK constraint generation
  });

  LeadGroupAssignment.belongsTo(LeadGroup, {
    foreignKey: "groupId",
    as: "Group",
    constraints: false,
  });

  // LeadGroupAssignment → User
  LeadGroupAssignment.belongsTo(User, {
    foreignKey: "userId",
    as: "User",
    constraints: false,
  });

  // Campaign → Template
  Campaign.belongsTo(Template, {
    foreignKey: "templateId",
    as: "Template",
    constraints: false,
  });

  // Campaign → LeadGroup
  Campaign.belongsTo(LeadGroup, {
    foreignKey: "leadGroupId",
    as: "LeadGroup",
    constraints: false,
  });

  // Campaign → EmailLog
  Campaign.hasMany(EmailLog, {
    foreignKey: "campaign_id",
    as: "EmailLogs",
    constraints: false,
  });

  EmailLog.belongsTo(Campaign, {
    foreignKey: "campaign_id",
    as: "Campaign",
    constraints: false,
  });
};
