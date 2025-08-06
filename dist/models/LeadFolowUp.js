"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class LeadFollowUp extends sequelize_1.Model {
}
LeadFollowUp.init({
    // Contact Info
    firstName: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    lastName: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    phone: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    email: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    address: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    // Lead Details
    leadSource: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    interest: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    leadStatus: { type: sequelize_1.DataTypes.STRING, defaultValue: "New", allowNull: false },
    status: { type: sequelize_1.DataTypes.STRING, defaultValue: "New", allowNull: false },
    // Sales Tracking
    quoteGiven: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    expectedValue: { type: sequelize_1.DataTypes.DECIMAL(10, 2), allowNull: false },
    // expectedCloseDate: { type: DataTypes.STRING  ,allowNull : false},
    saleStatus: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    // Customer Status
    isActiveCustomer: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    purchaseHistory: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    supportNotes: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    // Communication
    communicationType: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    communicationDate: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    followUpDate: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    communicationNotes: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    createdBy: { type: sequelize_1.DataTypes.STRING },
    // Follow-up 1
    firstFollowUpDate: { type: sequelize_1.DataTypes.STRING },
    firstFollowUpBy: { type: sequelize_1.DataTypes.STRING },
    firstFollowUpNotes: { type: sequelize_1.DataTypes.TEXT },
    firstFollowUpType: { type: sequelize_1.DataTypes.STRING },
    firstNextFollowUpDate: { type: sequelize_1.DataTypes.STRING },
    // Follow-up 2
    secondFollowUpDate: { type: sequelize_1.DataTypes.STRING },
    secondFollowUpBy: { type: sequelize_1.DataTypes.STRING },
    secondFollowUpNotes: { type: sequelize_1.DataTypes.TEXT },
    secondFollowUpType: { type: sequelize_1.DataTypes.STRING },
    secondNextFollowUpDate: { type: sequelize_1.DataTypes.STRING },
    // Follow-up 3
    thirdFollowUpDate: { type: sequelize_1.DataTypes.STRING },
    thirdFollowUpBy: { type: sequelize_1.DataTypes.STRING },
    thirdFollowUpNotes: { type: sequelize_1.DataTypes.TEXT },
    thirdFollowUpType: { type: sequelize_1.DataTypes.STRING },
    thirdNextFollowUpDate: { type: sequelize_1.DataTypes.STRING },
    // Final Follow-up
    finalFollowUpDate: { type: sequelize_1.DataTypes.STRING },
    finalFollowUpBy: { type: sequelize_1.DataTypes.STRING },
    finalFollowUpNotes: { type: sequelize_1.DataTypes.TEXT },
    finalFollowUpType: { type: sequelize_1.DataTypes.STRING },
    finalNextFollowUpDate: { type: sequelize_1.DataTypes.STRING },
}, {
    sequelize: database_1.default,
    modelName: "LeadFollowUp",
    tableName: "lead_follow_up",
    timestamps: true,
});
exports.default = LeadFollowUp;
