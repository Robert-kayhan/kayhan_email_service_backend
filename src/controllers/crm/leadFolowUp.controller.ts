import { Request, Response } from "express";
import { DATE, Op } from "sequelize";
import Flyer from "../../models/flyer/Flyer";
import LeadFollowUp from "../../models/crm/LeadFolowUp";
import LeadSalesTracking from "../../models/crm/LeadSalesTracking";
import LeadNote from "../../models/crm/Note";
import User from "../../models/user/User.model";

const createLead = async (req: any, res: Response) => {
  console.log("API call: Create Lead");

  const {
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
    followUpDate,
  } = req.body;

  // ✅ Validate required fields
  const requiredFields: Record<string, any> = {
    firstName,
    lastName,
    phone,
    email,
    leadSource,
    interest,
    quoteGiven,
    expectedValue,
    expectedCloseDate,
    isActiveCustomer,
    purchaseHistory,
  };

  // Conditional required field if sale was not done
  if (saleStatus === "Sale not done") {
    requiredFields["followUpDate"] = followUpDate;
  }

  const missingFields = Object.entries(requiredFields).filter(
    ([_, value]) => value === undefined || value === null || value === ""
  );

  // if (missingFields.length > 0) {
  //   res.status(400).json({
  //     message: "Missing required fields",
  //     missing: missingFields.map(([key]) => key),
  //   });
  //   return;
  // }

  try {
    const existingLead = await LeadFollowUp.findOne({ where: { email } });
    if (existingLead) {
      res.status(400).json({
        message: "Lead with this email already exists",
      });
      return;
    }
    const lead = await LeadFollowUp.create({
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
      followUpDate,
      createdBy: req.user?.email || "system",
    });
    await User.create({
      firstname: firstName,
      lastname: lastName,
      phone,
      email,
    });
    res.status(201).json(lead);
  } catch (error: any) {
    console.error("Error creating lead:", error);
    res.status(500).json({
      message: "Failed to create lead",
      error: error.message,
    });
  }
};

// GET all leads

const getAllLeads = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 25;
    const offset = (page - 1) * limit;

    const leadStatus = req.query.leadStatus as string | undefined;
    const search = req.query.search as string | undefined;

    const where: any = {};

    // Build filtering logic
    if (leadStatus && leadStatus !== "all") {
      const todayStr = new Date().toISOString().slice(0, 10);

      if (leadStatus === "Today's  Follow up") {
        where[Op.or] = [
          { followUpDate: todayStr },
          { firstNextFollowUpDate: todayStr },
          { secondNextFollowUpDate: todayStr },
          { thirdNextFollowUpDate: todayStr },
          { finalNextFollowUpDate: todayStr },
        ];
      } else if (leadStatus === "Sale done" || leadStatus === "Sale not done") {
        where.saleStatus = leadStatus;
      } else {
        where.status = leadStatus;
      }
    }

    // Add search functionality
    if (search) {
      const searchQuery = {
        [Op.or]: [
          { firstName: { [Op.like]: `%${search}%` } },
          { lastName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
        ],
      };

      // Merge with existing where clause
      if (where[Op.or]) {
        where[Op.and] = [where, searchQuery];
        delete where[Op.or]; // remove the old top-level OR to prevent conflict
      } else {
        Object.assign(where, searchQuery);
      }
    }

    // Count total matching records
    const totalItems = await LeadFollowUp.count({ where });

    // Fetch paginated records
    const leads = await LeadFollowUp.findAll({
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
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// GET a single lead by ID
const getLeadById = async (req: Request, res: Response) => {
  try {
    const lead = await LeadFollowUp.findByPk(req.params.id);
    const leadSales = await LeadSalesTracking.findOne({
      where: { lead_id: req.params.id },
    });
    const flyer = await Flyer.findOne({
      where: {
        CrmID: req.params.id,
      },
    });

    if (!lead) {
       res.status(404).json({ message: "Lead not found" });
       return
    }

    // Convert Sequelize instances to plain objects
    const leadData = lead.toJSON();
    const leadSalesData = leadSales ? leadSales.toJSON() : {};
    const flyerData = flyer ? flyer.toJSON() : {};

    // Merge into one response object
    const data = { ...leadData, ...leadSalesData, flyer: flyerData };

    res.status(200).json(data);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Failed to fetch lead", error: error.message });
  }
};

const updateLead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, address } = req.body;

    const lead = await LeadFollowUp.findByPk(id);

    if (!lead) {
      res.status(404).json({ message: "Lead not found" });
      return;
    }

    await lead.update({
      firstName,
      lastName,
      email,
      phone,
      address,
    });

    res.status(200).json(lead);
  } catch (error: any) {
    console.error("Error updating lead:", error);
    res.status(500).json({
      message: "Failed to update lead",
      error: error.message,
    });
  }
};

// DELETE a lead by ID
const deleteLead = async (req: Request, res: Response) => {
  try {
    const lead = await LeadFollowUp.findByPk(req.params.id);
    if (!lead) {
      res.status(404).json({ message: "Lead not found" });
      return;
    }

    await lead.destroy();
    res.status(200).json({ message: "Lead deleted successfully" });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Failed to delete lead", error: error.message });
  }
};
const updateFollowUpStage = async (req: any, res: Response) => {
  const { id, stage } = req.params;
  console.log("api calls");
  const updates = req.body;
  const userEmail = req.user?.email || "system";

  const followUpStages = ["first", "second", "third", "final"];

  if (!followUpStages.includes(stage)) {
    res.status(400).json({ message: "Invalid follow-up stage" });
  }

  try {
    const lead = await LeadFollowUp.findByPk(id);
    if (!lead) {
      res.status(404).json({ message: "Lead not found" });
      return;
    }

    const dateKey = `${stage}FollowUpDate`;
    const byKey = `${stage}FollowUpBy`;
    const notesKey = `${stage}FollowUpNotes`;
    const typeKey = `${stage}FollowUpType`;
    const nextDateKey = `${stage}NextFollowUpDate`;

    const updatePayload: any = {
      status: `${stage} Follow up`,
    };

    // If follow-up date is being newly set, also set "by"
    if (updates[dateKey] && !(lead as any)[dateKey]) {
      updatePayload[byKey] = userEmail;
    }

    // Allow updates if any of these fields are sent
    if (updates[dateKey]) updatePayload[dateKey] = updates[dateKey];
    if (updates[notesKey]) updatePayload[notesKey] = updates[notesKey];
    if (updates[typeKey]) updatePayload[typeKey] = updates[typeKey];
    if (updates[nextDateKey]) updatePayload[nextDateKey] = updates[nextDateKey];

    await lead.update(updatePayload);

    res.status(200).json({ message: `Updated ${stage} follow-up`, lead });
    console.log("its working");
  } catch (error: any) {
    console.error("Follow-up update failed:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const updateSaleStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      saleStatus,
      invoiceNumber,
      invoiceSentDate,
      quotationNumber,
      quotationSentDate,
      is_quotation,
      is_invoice,
    } = req.body;
    console.log(req.body);
    if (!saleStatus) {
      {
        res
          .status(400)
          .json({ message: "Missing 'saleStatus' in request body." });
      }
    }

    const lead: any = await LeadFollowUp.findByPk(id);
    if (!lead) {
      res.status(404).json({ message: "Lead not found." });
    }
    // Update lead status
    lead.saleStatus = saleStatus;
    if (saleStatus === "Sale done") lead.status = "Sale done";
    await lead.save();

    // Track in LeadSalesTracking
    const existingTracking: any = await LeadSalesTracking.findOne({
      where: { lead_id: id },
    });
    const now = new Date(); // current date-time

    const trackingData = {
      sale_status: saleStatus,
      is_quotation: !!quotationNumber, // true if quotationNumber exists
      is_invoice: !!invoiceNumber, // true if invoiceNumber exists
      invoice_number: invoiceNumber || null,
      invoice_send_date: invoiceNumber ? now : null,
      quotation_number: quotationNumber || null,
      quotation_send_date: quotationNumber ? now : null,
      sale_status_update_date: now,
      updatedAt: now,
    };

    if (existingTracking) {
      await existingTracking.update(trackingData);
    } else {
      await LeadSalesTracking.create({ lead_id: id, ...trackingData });
    }

    res
      .status(200)
      .json({ message: "Sale status updated successfully.", lead });
  } catch (error: any) {
    console.error("Error updating sale status:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

const addNote = async (req: any, res: Response) => {
  const { id } = req.params;
  console.log(req.body);
  const { note } = req.body;
  console.log("api call", id, note);
  try {
    const newNote = await LeadNote.create({
      leadFollowUpId: id,
      note,
    });
    res.status(201).json(newNote);
  } catch (err) {
    res.status(500).json({ error: "Failed to add note" });
  }
};
const getNotesByLeadId = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const notes = await LeadNote.findAll({
      where: { leadFollowUpId: id },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(notes);
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Failed to fetch notes", details: err.message });
  }
};
// GET /api/leads/check-email/:email
const checkEmail = async (req: Request, res: Response) => {
  // console.log("api call")
  try {
    const { email } = req.params;
    const lead = await LeadFollowUp.findOne({ where: { email } });

    if (lead) {
      res.json({ exists: true });
      return;
    }
    res.json({ exists: false });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Error checking email", error: err.message });
  }
};

export {
  createLead,
  getAllLeads,
  getLeadById,
  deleteLead,
  updateLead,
  updateFollowUpStage,
  updateSaleStatus,
  addNote,
  getNotesByLeadId,
  checkEmail,
};
