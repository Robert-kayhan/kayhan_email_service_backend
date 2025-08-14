import { Request, Response } from "express";
import LeadFolowUp from "../models/LeadFolowUp"; // Adjust path if needed
import LeadNote from "../models/Note";
import { Op } from "sequelize";


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
    const lead = await LeadFolowUp.create({
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

    const where: any = {};

    // Build filtering logic
    if (leadStatus && leadStatus !== "all") {
      const todayStr = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

      if (leadStatus === "Today's  Follow up") {
        // Match today's date in any of the follow-up date fields
        where[Op.or] = [
          { followUpDate: todayStr },
          { firstNextFollowUpDate: todayStr },
          { secondNextFollowUpDate: todayStr },
          { thirdNextFollowUpDate: todayStr },
          { finalNextFollowUpDate: todayStr },
        ];
      } else if (leadStatus === "Sale done" || leadStatus === "Sale not done") {
        // Filter by sale status
        where.saleStatus = leadStatus;
      } else {
        where.status = leadStatus;
      }
    }

    // Count total matching records
    const totalItems = await LeadFolowUp.count({ where });

    // Fetch paginated records
    const leads = await LeadFolowUp.findAll({
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
    // console.log("api call");
    const lead = await LeadFolowUp.findByPk(req.params.id);
    if (!lead) {
      res.status(404).json({ message: "Lead not found" });
    }
    res.status(200).json(lead);
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

    const lead = await LeadFolowUp.findByPk(id);

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
    const lead = await LeadFolowUp.findByPk(req.params.id);
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
    const lead = await LeadFolowUp.findByPk(id);
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

    const lead: any = await LeadFolowUp.findByPk(id);

    if (!lead) {
      res.status(404).json({ message: "Lead not found." });
      return;
    }

    lead.saleStatus = saleStatus;
    if(saleStatus === "Sale done"){
      lead.status = saleStatus;
    }
    await lead.save();

    res
      .status(200)
      .json({ message: "Sale status updated successfully.", lead });
  } catch (error) {
    console.error("Error updating sale status:", error);
    res.status(500).json({ message: "Server error." });
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
};
