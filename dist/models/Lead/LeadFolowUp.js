"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../../config/database"));
class LeadFollowUp extends sequelize_1.Model {
}
LeadFollowUp.init({
    firstName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    address: {
        type: sequelize_1.DataTypes.STRING,
    },
    leadSource: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    interest: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    leadStatus: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: "New",
    },
    quoteGiven: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    expectedValue: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    expectedCloseDate: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    isActiveCustomer: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    purchaseHistory: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    supportNotes: {
        type: sequelize_1.DataTypes.TEXT,
    },
    communicationType: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    communicationDate: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    followUpDate: {
        type: sequelize_1.DataTypes.DATEONLY,
    },
    communicationNotes: {
        type: sequelize_1.DataTypes.TEXT,
    },
    // 🟢 NEW Follow-Up Fields
    firstFollowUpDate: {
        type: sequelize_1.DataTypes.DATEONLY,
    },
    firstFollowUpBy: {
        type: sequelize_1.DataTypes.STRING,
    },
    firstFollowUpNotes: {
        type: sequelize_1.DataTypes.TEXT,
    },
    secondFollowUpDate: {
        type: sequelize_1.DataTypes.DATEONLY,
    },
    secondFollowUpBy: {
        type: sequelize_1.DataTypes.STRING,
    },
    secondFollowUpNotes: {
        type: sequelize_1.DataTypes.TEXT,
    },
    thirdFollowUpDate: {
        type: sequelize_1.DataTypes.DATEONLY,
    },
    thirdFollowUpBy: {
        type: sequelize_1.DataTypes.STRING,
    },
    thirdFollowUpNotes: {
        type: sequelize_1.DataTypes.TEXT,
    },
    finalFollowUpDate: {
        type: sequelize_1.DataTypes.DATEONLY,
    },
    finalFollowUpBy: {
        type: sequelize_1.DataTypes.STRING,
    },
    finalFollowUpNotes: {
        type: sequelize_1.DataTypes.TEXT,
    },
}, {
    sequelize: database_1.default,
    modelName: "LeadFollowUp",
    tableName: "lead_follow_up",
    timestamps: true,
});
exports.default = LeadFollowUp;
