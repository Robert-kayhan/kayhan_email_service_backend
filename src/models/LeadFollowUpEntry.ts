// models/LeadFollowUpEntry.ts
import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";
import LeadFollowUp from "./LeadFolowUp";

class LeadFollowUpEntry extends Model {}

LeadFollowUpEntry.init(
  {
    leadFollowUpId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "lead_follow_up",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    followUpDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    nextfollowUpDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    followUpBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    communicationType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
    modelName: "LeadFollowUpEntry",
    tableName: "lead_follow_up_entries",
    timestamps: true,
  }
);

// Associations
LeadFollowUp.hasMany(LeadFollowUpEntry, {
  foreignKey: "leadFollowUpId",
  as: "followUps",
});
LeadFollowUpEntry.belongsTo(LeadFollowUp, {
  foreignKey: "leadFollowUpId",
  as: "lead",
});

export default LeadFollowUpEntry;
