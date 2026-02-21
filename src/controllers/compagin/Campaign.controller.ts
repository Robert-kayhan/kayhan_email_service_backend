import { Request, Response } from "express";
import Template from "../../models/compagin/Template";
import LeadGroup from "../../models/compagin/LeadGroup";
import Campaign from "../../models/compagin/Campaign";
import EmailLog from "../../models/compagin/EmailLog";
import * as XLSX from "xlsx";
import { sendEmail } from "../../utils/sendEmail";
import { v4 as uuidv4 } from "uuid";

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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 25;
    const offset = (page - 1) * limit;

    // Optional filter by template type
    const templateType = req.query.templateType as "Retail" | "wholeSale" | undefined;

    const { rows: campaigns, count: total } = await Campaign.findAndCountAll({
      include: [
        {
          model: Template,
          as: "Template",
          required: !!templateType, // make inner join if filter exists
          where: templateType ? { type: templateType } : undefined,
        },
        {
          model: LeadGroup,
          as: "LeadGroup",
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.json({
      campaigns,
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



 const sendComaginUsingExel = async (req: Request, res: Response) => {
  try {
    const { campaignName, campaignSubject, fromEmail, senderName, templateId } =
      req.body;

    const file = req.file;

    // ✅ Validate
    if (
      !campaignName ||
      !campaignSubject ||
      !fromEmail ||
      !senderName ||
      !templateId ||
      !file
    ) {
       res.status(400).json({
        message: "All fields and excel file are required.",
      });
      return
    }

    // ✅ Get template
    const template = await Template.findByPk(templateId);
    if (!template) {
       res.status(404).json({ message: "Template not found." });
       return
    }

    // ✅ Read Excel
    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames?.[0];
    if (!sheetName) {
       res.status(400).json({ message: "Excel sheet not found." });
       return
    }

    const sheet = workbook.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    if (!rows.length) {
       res.status(400).json({ message: "Excel file is empty." });
       return
    }

    // ✅ Build recipients (support different column names)
    const recipientsRaw = rows
      .map((r) => {
        const email =
          (r.email || r.Email || r.EMAIL || r["Email Address"] || "")
            .toString()
            .trim()
            .toLowerCase();

        const name =
          (r.name || r.Name || r.firstname || r.Firstname || "")
            .toString()
            .trim();

        return { email, name };
      })
      .filter((r) => r.email);

    // ✅ unique emails
    const seen = new Set<string>();
    const recipients = recipientsRaw.filter((r) => {
      if (seen.has(r.email)) return false;
      seen.add(r.email);
      return true;
    });

    if (!recipients.length) {
       res.status(400).json({ message: "No emails found in Excel." });
       return
    }

    // ✅ Create Campaign
    const campaign = await Campaign.create({
      campaignName,
      campaignSubject,
      fromEmail,
      senderName,
      templateId,
    });

    let sent = 0;
    let failed = 0;

    for (const r of recipients) {
      // ✅ create log first
      const log = await EmailLog.create({
        campaign_id: campaign.id,
        email: r.email,
        status: "pending",
      });

      try {
        const pixelUrl = `https://mailerapi.kayhanaudio.com.au/api/send-email/open/?emailId=${log.id}`;

        const displayName = r.name || "there";

        const html = `
          <p>Hi ${displayName},</p>
          ${template.html || "<p>You have a new update from Kayhan Audio.</p>"}
          <img src="${pixelUrl}" width="1" height="1" style="display:none;" alt="pixel"/>
        `;

        const text = `Hi ${displayName},\n\n${
          campaignName || "You have a new update from Kayhan Audio."
        }`;

        await sendEmail({
          to: r.email,
          subject: campaignSubject,
          bodyHtml: html,
          bodyText: text,
          from: `${senderName} <${fromEmail}>`,
        });

        await log.update({ status: "sent" });
        sent++;
      } catch (err: any) {
        await log.update({
          status: "failed",
          errorMessage: err?.message || "Unknown error",
        });
        failed++;
        console.error("❌ Failed:", r.email, err);
      }
    }

     res.status(201).json({
      message: "Campaign created & sent successfully.",
      data: {
        campaignId: campaign.id,
        totalRecipients: recipients.length,
        sent,
        failed,
      },
    });
  } catch (error) {
    console.error("sendComaginUsingExel error:", error);
     res.status(500).json({ message: "Internal server error." });
  }
};
export {
  createCampaign,
  deleteCampaign,
  updateCampaign,
  getAllCampaigns,
  getCampaignById,
  getCampaignStats,
  sendComaginUsingExel
};
