"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class LeadGroupAssignment extends sequelize_1.Model {
}
LeadGroupAssignment.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "users", // ⚠️ reference actual table
            key: "id",
        },
        onDelete: "CASCADE",
    },
    groupId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "lead_groups", // ⚠️ reference actual table
            key: "id",
        },
        onDelete: "CASCADE",
    },
}, {
    sequelize: database_1.default,
    modelName: "LeadGroupAssignment",
    tableName: "lead_group_assignments",
    timestamps: true,
});
exports.default = LeadGroupAssignment;
