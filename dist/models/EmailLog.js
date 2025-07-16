"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// models/EmailLog.ts
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database")); // Adjust based on your setup
class EmailLog extends sequelize_1.Model {
}
EmailLog.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    campaign_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("sent", "failed"),
        allowNull: false,
    },
    errorMessage: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: database_1.default,
    tableName: "email_logs",
    modelName: "EmailLog",
});
exports.default = EmailLog;
