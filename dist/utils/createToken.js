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
            secure: true,
            sameSite: "none",
            domain: ".kayhanaudio.com.au",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        console.log("cokkie send");
    }
    catch (error) {
        console.log("error", error);
    }
};
exports.default = createToken;
