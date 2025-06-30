"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sendError = (res, statusCode, message) => {
    res.status(statusCode).json({
        success: false,
        error: message || "Something went wrong",
    });
};
exports.default = sendError;
