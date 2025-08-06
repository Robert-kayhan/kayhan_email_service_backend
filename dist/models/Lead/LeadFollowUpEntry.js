"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// models/LeadFollowUpEntry.ts
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../../config/database"));
const LeadFolowUp_1 = __importDefault(require("./LeadFolowUp"));
class LeadFollowUpEntry extends sequelize_1.Model {
}
LeadFollowUpEntry.init({
    leadFollowUpId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "lead_follow_up",
            key: "id",
        },
        onDelete: "CASCADE",
    },
    followUpDate: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    nextfollowUpDate: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: false,
    },
    followUpBy: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    communicationType: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    notes: {
        type: sequelize_1.DataTypes.TEXT,
    },
}, {
    sequelize: database_1.default,
    modelName: "LeadFollowUpEntry",
    tableName: "lead_follow_up_entries",
    timestamps: true,
});
// Associations
LeadFolowUp_1.default.hasMany(LeadFollowUpEntry, {
    foreignKey: "leadFollowUpId",
    as: "followUps",
});
LeadFollowUpEntry.belongsTo(LeadFolowUp_1.default, {
    foreignKey: "leadFollowUpId",
    as: "lead",
});
exports.default = LeadFollowUpEntry;
