import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

class LeadFollowUp extends Model {}

LeadFollowUp.init(
  {
    // Contact Info
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false },

    // Lead Details
    leadSource: { type: DataTypes.STRING, allowNull: false },
    interest: { type: DataTypes.STRING, allowNull: false },
    leadStatus: {
      type: DataTypes.STRING,
      defaultValue: "New",
      allowNull: false,
    },
    status: { type: DataTypes.STRING, defaultValue: "New", allowNull: false },

    // Sales Tracking
    quoteGiven: { type: DataTypes.STRING, allowNull: false },
    expectedValue: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    // expectedCloseDate: { type: DataTypes.STRING  ,allowNull : false},
    saleStatus: { type: DataTypes.STRING, allowNull: false },
    saleStatusUpdatedAt: { type: DataTypes.DATE, allowNull: true },
    // Customer Status
    isActiveCustomer: { type: DataTypes.STRING, allowNull: false },
    purchaseHistory: { type: DataTypes.TEXT, allowNull: false },
    supportNotes: { type: DataTypes.TEXT, allowNull: false },

    // Communication
    communicationType: { type: DataTypes.STRING, allowNull: true },
    communicationDate: { type: DataTypes.STRING, allowNull: true },
    followUpDate: { type: DataTypes.STRING, allowNull: true },
    communicationNotes: { type: DataTypes.TEXT, allowNull: true },

    createdBy: { type: DataTypes.STRING },

    // Follow-up 1
    firstFollowUpDate: { type: DataTypes.STRING },
    firstFollowUpBy: { type: DataTypes.STRING },
    firstFollowUpNotes: { type: DataTypes.TEXT },
    firstFollowUpType: { type: DataTypes.STRING },
    firstNextFollowUpDate: { type: DataTypes.STRING },

    // Follow-up 2
    secondFollowUpDate: { type: DataTypes.STRING },
    secondFollowUpBy: { type: DataTypes.STRING },
    secondFollowUpNotes: { type: DataTypes.TEXT },
    secondFollowUpType: { type: DataTypes.STRING },
    secondNextFollowUpDate: { type: DataTypes.STRING },

    // Follow-up 3
    thirdFollowUpDate: { type: DataTypes.STRING },
    thirdFollowUpBy: { type: DataTypes.STRING },
    thirdFollowUpNotes: { type: DataTypes.TEXT },
    thirdFollowUpType: { type: DataTypes.STRING },
    thirdNextFollowUpDate: { type: DataTypes.STRING },

    // Final Follow-up
    finalFollowUpDate: { type: DataTypes.STRING },
    finalFollowUpBy: { type: DataTypes.STRING },
    finalFollowUpNotes: { type: DataTypes.TEXT },
    finalFollowUpType: { type: DataTypes.STRING },
    finalNextFollowUpDate: { type: DataTypes.STRING },
  },
  {
    sequelize,
    modelName: "LeadFollowUp",
    tableName: "lead_follow_up",
    timestamps: true,
  }
);

export default LeadFollowUp;
