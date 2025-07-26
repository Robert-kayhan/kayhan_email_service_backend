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
exports.deleteLeadGroupById = exports.updateLeadGroupWithUsers = exports.getAllLeadGroupsWithID = exports.getAllLeadGroupsWithUsers = exports.createLeadGroupWithUsers = void 0;
const LeadGroup_1 = __importDefault(require("../models/LeadGroup"));
const LeadGroupAssignment_1 = __importDefault(require("../models/LeadGroupAssignment"));
const User_model_1 = __importDefault(require("../models/User.model"));
const createLeadGroupWithUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { groupName, userIds } = req.body;
        console.log("there are got ");
        if (!groupName || !Array.isArray(userIds)) {
            res.status(400).json({ message: "groupName and userIds are required." });
        }
        // 1. Create Group
        const group = yield LeadGroup_1.default.create({ groupName });
        // 2. Assign Users
        const assignments = userIds.map((userId) => ({
            userId,
            groupId: group.id,
        }));
        yield LeadGroupAssignment_1.default.bulkCreate(assignments);
        res.status(201).json({
            message: "Group created and users assigned.",
            group,
        });
    }
    catch (error) {
        console.error("Error creating group:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});
exports.createLeadGroupWithUsers = createLeadGroupWithUsers;
const getAllLeadGroupsWithUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 25;
        const offset = (page - 1) * limit;
        // 1. Count total groups
        const totalItems = yield LeadGroup_1.default.count();
        // 2. Fetch paginated groups with user count
        const groups = yield LeadGroup_1.default.findAll({
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        });
        // 3. Map total users per group
        const groupData = groups.map((group) => {
            const assignments = group.LeadGroupAssignments || [];
            const users = assignments.map((a) => a.User);
            return {
                id: group.id,
                groupName: group.groupName,
                createdAt: group.createdAt,
                totalLeads: users.length,
                users,
            };
        });
        const totalPages = Math.ceil(totalItems / limit);
        res.status(200).json({
            data: groupData,
            pagination: {
                currentPage: page,
                pageSize: limit,
                totalItems,
                totalPages,
            },
        });
    }
    catch (error) {
        console.error("Error fetching groups:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});
exports.getAllLeadGroupsWithUsers = getAllLeadGroupsWithUsers;
const getAllLeadGroupsWithID = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const groupId = parseInt(req.params.id);
        if (isNaN(groupId)) {
            res.status(400).json({ message: "Invalid group ID." });
        }
        const group = yield LeadGroup_1.default.findOne({
            where: { id: groupId },
            include: [
                {
                    model: LeadGroupAssignment_1.default,
                    as: "LeadGroupAssignments",
                    include: [{ model: User_model_1.default, as: "User" }],
                },
            ],
        });
        if (!group) {
            res.status(404).json({ message: "Group not found." });
            return;
        }
        const assignments = group.LeadGroupAssignments || [];
        const users = assignments.map((a) => a.User);
        res.status(200).json({
            id: group.id,
            groupName: group.groupName,
            createdAt: group.createdAt,
            totalLeads: users.length,
            users,
        });
    }
    catch (error) {
        console.error("Error fetching group by ID:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});
exports.getAllLeadGroupsWithID = getAllLeadGroupsWithID;
const updateLeadGroupWithUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { groupName, userIds } = req.body || {};
        console.log(req.body);
        const groupId = parseInt(req.params.id);
        if (!groupName || !Array.isArray(userIds) || isNaN(groupId)) {
            res.status(400).json({ message: "groupName, userIds, and valid group ID are required." });
        }
        const group = yield LeadGroup_1.default.findByPk(groupId);
        if (!group) {
            res.status(404).json({ message: "Group not found." });
            return;
        }
        yield group.update({ groupName });
        yield LeadGroupAssignment_1.default.destroy({ where: { groupId } });
        const newAssignments = userIds.map((userId) => ({
            userId,
            groupId,
        }));
        yield LeadGroupAssignment_1.default.bulkCreate(newAssignments);
        res.status(200).json({ message: "Group updated successfully." });
    }
    catch (error) {
        console.error("Error updating group:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});
exports.updateLeadGroupWithUsers = updateLeadGroupWithUsers;
const deleteLeadGroupById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const groupId = parseInt(req.params.id);
        console.log(groupId);
        // Validate ID
        if (isNaN(groupId)) {
            res.status(400).json({ message: "Invalid group ID." });
        }
        // Check if group exists
        const group = yield LeadGroup_1.default.findByPk(groupId);
        if (!group) {
            res.status(404).json({ message: "Group not found." });
            return;
        }
        // Delete assignments first (foreign key constraint)
        yield LeadGroupAssignment_1.default.destroy({ where: { groupId } });
        // Delete group
        yield group.destroy();
        res.status(200).json({ message: "Group and its assignments deleted successfully." });
    }
    catch (error) {
        console.error("Error deleting group:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});
exports.deleteLeadGroupById = deleteLeadGroupById;
