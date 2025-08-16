import { Request, Response } from "express";
import Campaign from "../models/Campaign";
import Template from "../models/Template";
import LeadGroup from "../models/LeadGroup";
import EmailLog from "../models/EmailLog";

// CREATE Campaign
const createCampaign = async (req: Request, res: Response) => {
  try {
    const { campaignName,campaignSubject, fromEmail, senderName, templateId, leadGroupId } =
      req.body;

    if (
      !campaignName ||
      !fromEmail ||
      !senderName ||
      !templateId ||
      !leadGroupId||
      !campaignSubject
    ) {
      res.status(400).json({ message: "All fields are required." });
    }

    const template = await Template.findByPk(templateId);
    if (!template) {
      res.status(404).json({ message: "Template not found." });
    }

    const leadGroup = await LeadGroup.findByPk(leadGroupId);
    if (!leadGroup) {
      res.status(404).json({ message: "Lead group not found." });
    }

    const campaign = await Campaign.create({
      campaignName,
      campaignSubject,
      fromEmail,
      senderName,
      templateId,
      leadGroupId,
    });

    res.status(201).json({
      message: "Campaign created successfully.",
      data: campaign,
    });
    return
  } catch (error) {
    console.error("Error creating campaign:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// GET all campaigns
const getAllCampaigns = async (req: Request, res: Response) => {
  try {
    // Parse query params
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 25;
    const offset = (page - 1) * limit;

    // Fetch campaigns with pagination and associated models
    const { rows: campaigns, count: total } = await Campaign.findAndCountAll({
      // include: [
      //   { model: Template, as: "Template" },
      //   { model: LeadGroup, as: "LeadGroup" },
      // ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.json({
      campaigns: campaigns,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


// GET single campaign by ID
const getCampaignById = async (req: Request, res: Response) => {
  try {
    const campaignId = parseInt(req.params.id, 10);
    console.log("api call ")
    if (isNaN(campaignId)) {
      res.status(400).json({ message: "Invalid campaign ID." });
      return 
    }

    // Fetch campaign with related template and lead group
    const campaign = await Campaign.findByPk(campaignId, {
      include: [
        { model: Template, as: "Template" },
        { model: LeadGroup, as: "LeadGroup" },
      ],
    });

    if (!campaign) {
       res.status(404).json({ message: "Campaign not found." });
       return
    }

    // Fetch email stats for this campaign
    const total = await EmailLog.count({ where: { campaign_id: campaignId } });
    const sent = await EmailLog.count({ where: { campaign_id: campaignId, status: "sent" } });
    const pending = await EmailLog.count({ where: { campaign_id: campaignId, status: "pending" } });
    const failed = await EmailLog.count({ where: { campaign_id: campaignId, status: "failed" } });
 const opened = await EmailLog.count({ where: { campaign_id: campaignId, opened : true } });
    // Optionally, calculate opened if you track it
    // const opened = await EmailLog.count({ where: { campaign_id: campaignId, status: "sent", isOpened: true } });

    const stats = {
      total,
      sent,
      pending,
      failed,
      opened, // replace with actual opened if available
    };

    res.json({ data: campaign, stats });
  } catch (error) {
    console.error("Error fetching campaign:", error);
     res.status(500).json({ message: "Internal server error." });
  }
};

// UPDATE campaign
const updateCampaign = async (req: Request, res: Response) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);

    if (!campaign) {
      res.status(404).json({ message: "Campaign not found." });
      return;
    }

    const { campaignName, fromEmail, senderName, templateId, leadGroupId } =
      req.body;

    await campaign.update({
      campaignName: campaignName ?? campaign.campaignName,
      fromEmail: fromEmail ?? campaign.fromEmail,
      senderName: senderName ?? campaign.senderName,
      templateId: templateId ?? campaign.templateId,
      leadGroupId: leadGroupId ?? campaign.leadGroupId,
    });

    res.json({
      message: "Campaign updated successfully.",
      data: campaign,
    });
  } catch (error) {
    console.error("Error updating campaign:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// DELETE campaign
const deleteCampaign = async (req: Request, res: Response) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);

    if (!campaign) {
      res.status(404).json({ message: "Campaign not found." });
      return;
    }

    await campaign.destroy();

    res.json({ message: "Campaign deleted successfully." });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
const getCampaignStats = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Count total emails for the campaign
    const total = await EmailLog.count({ where: { campaign_id: id } });

    // Count emails by status
    const sent = await EmailLog.count({ where: { campaign_id: id, status: "sent" } });
    const pending = await EmailLog.count({ where: { campaign_id: id, status: "pending" } });
    const failed = await EmailLog.count({ where: { campaign_id: id, status: "failed" } });

    const opened = await EmailLog.count({ where: { campaign_id: id, status: "opened",  } });
    console.log(opened)
     res.json({ total, sent, pending, failed, opened });
  } catch (err) {
    console.error(err);
     res.status(500).json({ message: "Server error" });
  }
};
export {
  createCampaign,
  deleteCampaign,
  updateCampaign,
  getAllCampaigns,
  getCampaignById,
  getCampaignStats
};
