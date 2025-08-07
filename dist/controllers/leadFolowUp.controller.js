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
exports.getNotesByLeadId = exports.addNote = exports.updateSaleStatus = exports.updateFollowUpStage = exports.updateLead = exports.deleteLead = exports.getLeadById = exports.getAllLeads = exports.createLead = void 0;
const LeadFolowUp_1 = __importDefault(require("../models/LeadFolowUp")); // Adjust path if needed
const Note_1 = __importDefault(require("../models/Note"));
const sequelize_1 = require("sequelize");
const createLead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log("API call: Create Lead");
    const { firstName, lastName, phone, email, address, leadSource, interest, saleStatus, quoteGiven, expectedValue, expectedCloseDate, isActiveCustomer, purchaseHistory, supportNotes, communicationType, communicationDate, followUpDate, communicationNotes, } = req.body;
    // ✅ Validate required fields
    const requiredFields = {
        firstName,
        lastName,
        phone,
        email,
        leadSource,
        interest,
        saleStatus,
        quoteGiven,
        expectedValue,
        expectedCloseDate,
        isActiveCustomer,
        purchaseHistory,
        communicationType,
        communicationDate,
    };
    console.log(req.body);
    // Conditional required field if sale was not done
    if (saleStatus === "Sale not done") {
        requiredFields["followUpDate"] = followUpDate;
    }
    const missingFields = Object.entries(requiredFields).filter(([_, value]) => value === undefined || value === null);
    if (missingFields.length > 0) {
        res.status(400).json({
            message: "Missing required fields",
            missing: missingFields.map(([key]) => key),
        });
        return;
    }
    try {
        const lead = yield LeadFolowUp_1.default.create({
            firstName,
            lastName,
            phone,
            email,
            address,
            leadSource,
            interest,
            saleStatus,
            quoteGiven,
            expectedValue,
            expectedCloseDate,
            isActiveCustomer,
            purchaseHistory,
            supportNotes,
            communicationType,
            communicationDate,
            followUpDate,
            communicationNotes,
            createdBy: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.email) || "system",
        });
        res.status(201).json(lead);
    }
    catch (error) {
        console.error("Error creating lead:", error);
        res.status(500).json({
            message: "Failed to create lead",
            error: error.message,
        });
    }
});
exports.createLead = createLead;
// GET all leads
const getAllLeads = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 25;
        const offset = (page - 1) * limit;
        const leadStatus = req.query.leadStatus;
        const where = {};
        if (leadStatus && leadStatus !== "all") {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);
            if (leadStatus === "Today") {
                // Filter by followUpDate being today
                where.followUpDate = {
                    [sequelize_1.Op.between]: [todayStart, todayEnd],
                };
            }
            else if (leadStatus === "Sale done" || leadStatus === "Sale not done") {
                // Filter by saleStatus field
                where.saleStatus = leadStatus;
            }
            else {
                // Filter by general status field
                where.status = leadStatus;
            }
        }
        const totalItems = yield LeadFolowUp_1.default.count({ where });
        const leads = yield LeadFolowUp_1.default.findAll({
            where,
            offset,
            limit,
            order: [["createdAt", "DESC"]],
        });
        const totalPages = Math.ceil(totalItems / limit);
        res.status(200).json({
            data: leads,
            total: totalItems,
            totalPages,
            currentPage: page,
            pageSize: limit,
        });
    }
    catch (error) {
        console.error("Error fetching leads:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});
exports.getAllLeads = getAllLeads;
// GET a single lead by ID
const getLeadById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // console.log("api call");
        const lead = yield LeadFolowUp_1.default.findByPk(req.params.id);
        if (!lead) {
            res.status(404).json({ message: "Lead not found" });
        }
        res.status(200).json(lead);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Failed to fetch lead", error: error.message });
    }
});
exports.getLeadById = getLeadById;
const updateLead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, phone, address } = req.body;
        const lead = yield LeadFolowUp_1.default.findByPk(id);
        if (!lead) {
            res.status(404).json({ message: "Lead not found" });
            return;
        }
        yield lead.update({
            firstName,
            lastName,
            email,
            phone,
            address,
        });
        res.status(200).json(lead);
    }
    catch (error) {
        console.error("Error updating lead:", error);
        res.status(500).json({
            message: "Failed to update lead",
            error: error.message,
        });
    }
});
exports.updateLead = updateLead;
// DELETE a lead by ID
const deleteLead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lead = yield LeadFolowUp_1.default.findByPk(req.params.id);
        if (!lead) {
            res.status(404).json({ message: "Lead not found" });
            return;
        }
        yield lead.destroy();
        res.status(200).json({ message: "Lead deleted successfully" });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Failed to delete lead", error: error.message });
    }
});
exports.deleteLead = deleteLead;
const updateFollowUpStage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id, stage } = req.params;
    console.log("api calls");
    const updates = req.body;
    const userEmail = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.email) || "system";
    const followUpStages = ["first", "second", "third", "final"];
    if (!followUpStages.includes(stage)) {
        res.status(400).json({ message: "Invalid follow-up stage" });
    }
    try {
        const lead = yield LeadFolowUp_1.default.findByPk(id);
        if (!lead) {
            res.status(404).json({ message: "Lead not found" });
            return;
        }
        const dateKey = `${stage}FollowUpDate`;
        const byKey = `${stage}FollowUpBy`;
        const notesKey = `${stage}FollowUpNotes`;
        const typeKey = `${stage}FollowUpType`;
        const nextDateKey = `${stage}NextFollowUpDate`;
        const updatePayload = {
            status: `${stage} Follow up`
        };
        // If follow-up date is being newly set, also set "by"
        if (updates[dateKey] && !lead[dateKey]) {
            updatePayload[byKey] = userEmail;
        }
        // Allow updates if any of these fields are sent
        if (updates[dateKey])
            updatePayload[dateKey] = updates[dateKey];
        if (updates[notesKey])
            updatePayload[notesKey] = updates[notesKey];
        if (updates[typeKey])
            updatePayload[typeKey] = updates[typeKey];
        if (updates[nextDateKey])
            updatePayload[nextDateKey] = updates[nextDateKey];
        yield lead.update(updatePayload);
        res.status(200).json({ message: `Updated ${stage} follow-up`, lead });
        console.log("its working");
    }
    catch (error) {
        console.error("Follow-up update failed:", error);
        res
            .status(500)
            .json({ message: "Internal Server Error", error: error.message });
    }
});
exports.updateFollowUpStage = updateFollowUpStage;
const updateSaleStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("api is calls ", req.body);
        const { id } = req.params;
        const { saleStatus } = req.body;
        console.log(req.body, "this is body");
        if (!saleStatus) {
            res
                .status(400)
                .json({ message: "Missing 'saleStatus' in request body." });
            return;
        }
        const lead = yield LeadFolowUp_1.default.findByPk(id);
        if (!lead) {
            res.status(404).json({ message: "Lead not found." });
            return;
        }
        lead.saleStatus = saleStatus;
        lead.status = saleStatus;
        yield lead.save();
        res
            .status(200)
            .json({ message: "Sale status updated successfully.", lead });
    }
    catch (error) {
        console.error("Error updating sale status:", error);
        res.status(500).json({ message: "Server error." });
    }
});
exports.updateSaleStatus = updateSaleStatus;
const addNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    console.log(req.body);
    const { note } = req.body;
    console.log("api call", id, note);
    try {
        const newNote = yield Note_1.default.create({
            leadFollowUpId: id,
            note,
        });
        res.status(201).json(newNote);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to add note" });
    }
});
exports.addNote = addNote;
const getNotesByLeadId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const notes = yield Note_1.default.findAll({
            where: { leadFollowUpId: id },
            order: [["createdAt", "DESC"]],
        });
        res.status(200).json(notes);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch notes", details: err.message });
    }
});
exports.getNotesByLeadId = getNotesByLeadId;
