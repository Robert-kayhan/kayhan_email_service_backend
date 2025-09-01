import Booking from "./bookingSystem/Booking";
import BookingItem from "./bookingSystem/BookingItem";
import MobileInstallationDetail from "./bookingSystem/MobileInstallationDetail";
import Vehicle from "./bookingSystem/Vehicle";
import Campaign from "./Campaign";
import EmailLog from "./EmailLog";
import LeadFollowUp from "./LeadFolowUp";
import LeadGroup from "./LeadGroup";
import LeadGroupAssignment from "./LeadGroupAssignment";
import LeadNote from "./Note";
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


LeadFollowUp.hasMany(LeadNote, {
    foreignKey: "leadFollowUpId",
    as: "Notes",
    onDelete: "CASCADE",
    constraints: false,
  });

  LeadNote.belongsTo(LeadFollowUp, {
    foreignKey: "leadFollowUpId",
    as: "LeadFollowUp",
    constraints: false,
  });

  // booking.model.ts
Booking.belongsTo(User, { foreignKey: "customerId" });
User.hasMany(Booking, { foreignKey: "customerId" });

Booking.belongsTo(Vehicle, { foreignKey: "vehicleId" });
Vehicle.hasMany(Booking, { foreignKey: "vehicleId" });

Booking.hasMany(BookingItem, { foreignKey: "bookingId" });
BookingItem.belongsTo(Booking, { foreignKey: "bookingId" });

Booking.hasOne(MobileInstallationDetail, { foreignKey: "bookingId" });
MobileInstallationDetail.belongsTo(Booking, { foreignKey: "bookingId" });
