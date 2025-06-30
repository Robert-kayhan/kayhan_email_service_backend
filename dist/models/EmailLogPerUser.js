"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class EmailLogPerUser extends sequelize_1.Model {
}
EmailLogPerUser.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    campaignIds: {
        type: sequelize_1.DataTypes.JSON, // Use ARRAY(DataTypes.INTEGER) if you’re using PostgreSQL
        allowNull: false,
        defaultValue: [],
    },
    lastSentAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: database_1.default,
    modelName: "EmailLogPerUser",
    tableName: "EmailLogPerUser",
    timestamps: false,
});
exports.default = EmailLogPerUser;
