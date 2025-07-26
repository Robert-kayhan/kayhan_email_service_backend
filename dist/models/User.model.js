"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class User extends sequelize_1.Model {
}
User.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    firstname: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    lastname: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    phone: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
    },
    country: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    state: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    city: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    street: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    postcode: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: true,
    },
    role: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
    },
    isSubscribed: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true,
    },
    unsubscribeToken: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
}, {
    sequelize: database_1.default,
    tableName: "users",
    modelName: "User",
    timestamps: true,
});
exports.default = User;
