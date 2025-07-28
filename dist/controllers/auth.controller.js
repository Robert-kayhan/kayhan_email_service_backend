"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logout = exports.getMe = exports.Sign = exports.createUser = void 0;
const Admin_1 = __importDefault(require("../models/Admin"));
const createToken_1 = __importDefault(require("../utils/createToken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// 👤 Register New User
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstname, lastname, email, password } = req.body;
    console.log("connect successfully");
    if (!firstname || !lastname || !email || !password) {
        res.status(400).json({ error: "Please fill all fields" });
        return;
    }
    try {
        const existingUser = yield Admin_1.default.findOne({ where: { email } });
        if (existingUser) {
            res.status(409).json({ error: "User already exists" });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = yield Admin_1.default.create({
            firstname,
            lastname,
            email,
            password: hashedPassword,
        });
        (0, createToken_1.default)(res, user.id);
        res.status(201).json({
            message: "User registered successfully",
            data: {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
            },
        });
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.createUser = createUser;
// 🔐 Login User
const Sign = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
    }
    try {
        const user = yield Admin_1.default.findOne({ where: { email } });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        (0, createToken_1.default)(res, user.id);
        res.status(200).json({
            message: "Logged in successfully",
            data: {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                phone: user.phone,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.Sign = Sign;
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield Admin_1.default.findByPk(req.user.id, {
            attributes: { exclude: ["password"] },
        });
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.status(200).json({
            message: "Authenticated user",
            data: user,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.getMe = getMe;
const Logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.cookie("jwt", "", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            domain: ".kayhanaudio.com.au", // must match exactly
            expires: new Date(0), // or maxAge: 0
        });
        res.status(200).json({ message: "Logged out successfully." });
    }
    catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ message: "Logout failed." });
    }
});
exports.Logout = Logout;
