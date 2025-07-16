"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.getUsersWithLeadStatus = exports.updateUser = exports.deleteUser = exports.getALLUser = exports.createMultipleUser = exports.createOneUser = void 0;
const User_model_1 = __importDefault(require("../models/User.model"));
const XLSX = __importStar(require("xlsx"));
const sequelize_1 = require("sequelize");
const SendResponse_1 = __importDefault(require("../utils/SendResponse"));
const axios_1 = __importDefault(require("axios"));
const createOneUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstname, lastname, email, phone, address } = req.body;
    try {
        // Check if a user with the same email OR phone exists
        const existingUser = yield User_model_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [{ email }, { phone }],
            },
        });
        if (existingUser) {
            res
                .status(400)
                .json({ message: "User already exists with this email or phone." });
            return;
        }
        // Create the user
        yield User_model_1.default.create({
            firstname,
            lastname,
            email,
            phone,
            address,
            password: "", // You can hash/set a default password here if needed
        });
        res.status(201).json({ message: "User created successfully." });
    }
    catch (error) {
        console.error("Error creating user:", error);
        res
            .status(500)
            .json({ message: "Something went wrong while creating the user." });
    }
});
exports.createOneUser = createOneUser;
const createMultipleUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        if (!req.file)
            (0, SendResponse_1.default)(res, 404, "please upload file");
        const workBook = XLSX.read((_a = req.file) === null || _a === void 0 ? void 0 : _a.buffer, { type: "buffer" });
        const sheetName = workBook.SheetNames[0];
        const SheetData = XLSX.utils.sheet_to_json(workBook.Sheets[sheetName]);
        const usersToCreate = [];
        for (const row of SheetData) {
            const firstname = row["First Name"];
            const lastname = row["Last Name"];
            const email = row["Email"];
            const phone = row["Phone"];
            const mailingStreet = ((_b = row["Mailing Street"]) === null || _b === void 0 ? void 0 : _b.trim()) || "";
            const mailingCity = ((_c = row["Mailing City"]) === null || _c === void 0 ? void 0 : _c.trim()) || "";
            const mailingState = ((_d = row["Mailing State"]) === null || _d === void 0 ? void 0 : _d.trim()) || "";
            const mailingZip = ((_e = row["Mailing Zip"]) === null || _e === void 0 ? void 0 : _e.toString().trim()) || "";
            const mailingCountry = ((_f = row["Mailing Country"]) === null || _f === void 0 ? void 0 : _f.trim()) || "";
            const address = [
                mailingStreet,
                mailingCity,
                mailingState,
                mailingZip,
                mailingCountry,
            ]
                .filter(Boolean)
                .join(", ");
            if (!firstname || !lastname || !email || !phone || !address)
                continue; // Required
            const existing = yield User_model_1.default.findOne({
                where: {
                    [sequelize_1.Op.or]: [{ email }, { phone }],
                },
            });
            if (!existing) {
                usersToCreate.push({
                    firstname,
                    lastname,
                    email,
                    phone,
                    address,
                });
            }
        }
        if (usersToCreate.length > 0) {
            yield User_model_1.default.bulkCreate(usersToCreate);
        }
        res.status(200).json({
            message: `Upload complete. ${usersToCreate.length} users created.`,
        });
    }
    catch (error) {
        console.error("Bulk upload error:", error);
        res.status(500).json({ message: "Failed to upload users." });
    }
});
exports.createMultipleUser = createMultipleUser;
const getALLUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Default values if query params are not passed
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { count, rows: users } = yield User_model_1.default.findAndCountAll({
            attributes: ["id", "firstname", "lastname", "email", "phone", "address", "role", "createdAt"],
            order: [["createdAt", "DESC"]],
            limit,
            offset,
        });
        const formattedUsers = users.map((user) => ({
            id: user.id,
            name: `${user.firstname} ${user.lastname}`,
            email: user.email,
            phone: user.phone,
            role: user.role === 1 ? "Admin" : "User",
            status: "Active",
            address: user.address
        }));
        res.status(200).json({
            data: formattedUsers,
            pagination: {
                totalItems: count,
                currentPage: page,
                totalPages: Math.ceil(count / limit),
                pageSize: limit,
            },
        });
    }
    catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getALLUser = getALLUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id; // Ensure ID is an integer
        // if (isNaN(userId)) {
        //   res.status(400).json({ message: "Invalid user ID" });
        //   return;
        // }
        const deletedCount = yield User_model_1.default.destroy({
            where: { email: userId },
        });
        if (deletedCount === 0) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json({ message: "User deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.deleteUser = deleteUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id; // You may use `email` instead of `id` if that's how you identify users
        const { firstname, lastname, phone, address, role, email } = req.body;
        const user = yield User_model_1.default.findOne({ where: { email: userId } }); // You can use `id` here if needed
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        user.firstname = firstname !== null && firstname !== void 0 ? firstname : user.firstname;
        user.lastname = lastname !== null && lastname !== void 0 ? lastname : user.lastname;
        user.phone = phone !== null && phone !== void 0 ? phone : user.phone;
        user.address = address !== null && address !== void 0 ? address : user.address;
        user.role = role !== null && role !== void 0 ? role : user.role;
        user.email = email !== null && email !== void 0 ? email : user.email;
        yield user.save();
        res.status(200).json({ message: "User updated successfully", user });
    }
    catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.updateUser = updateUser;
const getUsersWithLeadStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = String(req.query.search || "").toLowerCase();
        const hasLeadOnly = req.query.hasLeadOnly === "true";
        // 1. Get external users
        const externalResponse = yield axios_1.default.get("http://localhost:5003/v1/users/all");
        const externalUsers = externalResponse.data;
        if (!Array.isArray(externalUsers)) {
            res.status(400).json({ message: "Invalid external users format" });
            return;
        }
        // 2. Filter by search term (optional)
        let filteredUsers = externalUsers;
        if (search) {
            filteredUsers = filteredUsers.filter((user) => {
                return ((user.name && user.name.toLowerCase().includes(search)) ||
                    (user.last_name && user.last_name.toLowerCase().includes(search)) ||
                    (user.email && user.email.toLowerCase().includes(search)));
            });
        }
        // 3. Get matching lead emails only for filtered users
        const emails = filteredUsers.map((u) => u.email).filter(Boolean);
        const leads = yield User_model_1.default.findAll({
            where: { email: { [sequelize_1.Op.in]: emails } },
            attributes: ["email"],
        });
        const leadEmailSet = new Set(leads.map((l) => l.email));
        // 4. Attach hasLead
        const combinedUsers = filteredUsers.map((user) => (Object.assign(Object.assign({}, user), { hasLead: leadEmailSet.has(user.email) })));
        // 5. Apply hasLeadOnly filter if requested
        let finalUsers = combinedUsers;
        if (hasLeadOnly) {
            finalUsers = combinedUsers.filter((u) => u.hasLead);
        }
        // 6. Paginate final list
        const total = finalUsers.length;
        const paginatedUsers = finalUsers.slice(offset, offset + limit);
        // 7. Send response
        res.json({
            success: true,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            data: paginatedUsers,
        });
    }
    catch (error) {
        console.error("Error fetching users with lead status:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.getUsersWithLeadStatus = getUsersWithLeadStatus;
