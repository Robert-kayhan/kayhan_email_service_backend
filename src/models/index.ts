import Booking from "./bookingSystem/Booking";
import BookingItem from "./bookingSystem/BookingItem";
import { Invoice } from "./bookingSystem/Invoice";
import JobReport from "./bookingSystem/JobReport";
import MobileInstallationDetail from "./bookingSystem/MobileInstallationDetail";
import Vehicle from "./bookingSystem/Vehicle";
import CarModel from "./Inventory/CarModel";
import LeadGroupAssignment from "./crm/LeadGroupAssignment";
import Template from "./compagin/Template";
import LeadGroup from "./compagin/LeadGroup";
import User from "./user/User.model";
import Campaign from "./compagin/Campaign";
import EmailLog from "./compagin/EmailLog";
import LeadFollowUp from "./crm/LeadFolowUp";
import LeadNote from "./crm/Note";

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

Invoice.belongsTo(User, { foreignKey: "userId", as: "User" });
User.hasMany(Invoice, { foreignKey: "userId", as: "Invoices" });

Booking.hasMany(JobReport, { foreignKey: "bookingId", as: "reports" });
JobReport.belongsTo(Booking, { foreignKey: "bookingId", as: "booking" });

CarModel.hasMany(CarModel, { as: "children", foreignKey: "parent_id" });
CarModel.belongsTo(CarModel, { as: "parent", foreignKey: "parent_id" });
