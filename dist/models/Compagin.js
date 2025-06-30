"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const Template_1 = __importDefault(require("./Template"));
const EmailLogPerUser_1 = __importDefault(require("./EmailLogPerUser")); // ⬅️ Import the new model
class Campaign extends sequelize_1.Model {
}
Campaign.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    subject: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    templateId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "EmailTemplates",
            key: "id",
        },
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("draft", "scheduled", "sent"),
        allowNull: false,
        defaultValue: "draft",
    },
    scheduledAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    sentAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: database_1.default,
    modelName: "EmailCampaign",
    tableName: "EmailCampaigns",
    timestamps: true,
});
// Set associations
Campaign.belongsTo(Template_1.default, {
    foreignKey: "templateId",
    as: "template",
});
// ✅ Add the new relation
Campaign.hasMany(EmailLogPerUser_1.default, {
    foreignKey: "campaignId",
    as: "recipients",
});
exports.default = Campaign;
