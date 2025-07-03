import { Request, Response } from "express";
import Campaign from "../models/Campaign";
import Template from "../models/Template";
import LeadGroup from "../models/LeadGroup";

// CREATE Campaign
const createCampaign = async (req: Request, res: Response) => {
  try {
    const { campaignName, fromEmail, senderName, templateId, leadGroupId } =
      req.body;

    if (
      !campaignName ||
      !fromEmail ||
      !senderName ||
      !templateId ||
      !leadGroupId
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
    const campaigns = await Campaign.findAll({
      include: [Template, LeadGroup],
      order: [["createdAt", "DESC"]],
    });
    res.json({ data: campaigns });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// GET single campaign by ID
const getCampaignById = async (req: Request, res: Response) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id, {
      include: [Template, LeadGroup],
    });

    if (!campaign) {
      res.status(404).json({ message: "Campaign not found." });
    }

    res.json({ data: campaign });
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
export {
  createCampaign,
  deleteCampaign,
  updateCampaign,
  getAllCampaigns,
  getCampaignById,
};
