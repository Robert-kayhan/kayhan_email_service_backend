import Campaign from "./Campaign";
import LeadGroup from "./LeadGroup";
import LeadGroupAssignment from "./LeadGroupAssignment";
import Template from "./Template";
import User from "./User.model";

// Define associations here:
export const setupAssociations = () => {
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
};
Campaign.belongsTo(Template, { foreignKey: "templateId" });
Campaign.belongsTo(LeadGroup, { foreignKey: "leadGroupId" });
