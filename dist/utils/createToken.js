"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const createToken = (res, id) => {
    try {
        const token = jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: "30d",
        });
        res.cookie("jwt", token, {
            httpOnly: true,
            secure: false, // HTTPS only in production
            sameSite: "none", // Protects from CSRF
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });
    }
    catch (error) {
        console.log("error", error);
    }
};
exports.default = createToken;
