"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class Template extends sequelize_1.Model {
}
Template.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    design: {
        type: sequelize_1.DataTypes.JSON, // store full JSON design object
        allowNull: false,
    },
    html: {
        type: sequelize_1.DataTypes.TEXT, // long HTML string
        allowNull: false,
    },
}, {
    sequelize: database_1.default,
    modelName: "Template",
    tableName: "templates",
    timestamps: true, // createdAt and updatedAt
});
exports.default = Template;
