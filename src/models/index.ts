// models/associations.ts
import Campaign from "./Campaign";
import EmailLog from "./EmailLog";
import LeadGroup from "./LeadGroup";
import LeadGroupAssignment from "./LeadGroupAssignment";
import Template from "./Template";
import User from "./User.model";

export const setupAssociations = () => {
  // LeadGroup → LeadGroupAssignment → User
  LeadGroup.hasMany(LeadGroupAssignment, {
    foreignKey: "groupId",
    as: "LeadGroupAssignments",
  });

  LeadGroupAssignment.belongsTo(LeadGroup, {
    foreignKey: "groupId",
    as: "Group",
  });

  LeadGroupAssignment.belongsTo(User, {
    foreignKey: "userId",
    as: "User",
  });

  // Campaign → Template
  Campaign.belongsTo(Template, { foreignKey: "templateId", as: "Template" });

  // Campaign → LeadGroup
  Campaign.belongsTo(LeadGroup, { foreignKey: "leadGroupId", as: "LeadGroup" });

  // ✅ Campaign → EmailLog
  Campaign.hasMany(EmailLog, {
    foreignKey: "campaign_id",
    as: "EmailLogs",
  });

  EmailLog.belongsTo(Campaign, {
    foreignKey: "campaign_id",
    as: "Campaign",
  });
};
