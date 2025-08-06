"use strict";
// models/LeadNote.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class LeadNote extends sequelize_1.Model {
}
LeadNote.init({
    leadFollowUpId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    note: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
}, {
    sequelize: database_1.default,
    modelName: "LeadNote",
    tableName: "lead_notes",
    timestamps: true,
});
exports.default = LeadNote;
