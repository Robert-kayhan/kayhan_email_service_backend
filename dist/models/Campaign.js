"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database")); // adjust path to your sequelize instance
class Campaign extends sequelize_1.Model {
}
Campaign.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    campaignName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    campaignSubject: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    fromEmail: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    senderName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    templateId: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    leadGroupId: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
}, {
    sequelize: database_1.default,
    tableName: "campaigns",
    modelName: "Campaign",
});
exports.default = Campaign;
