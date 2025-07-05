import { Request, Response } from "express";
import Campaign from "../models/Campaign";
import EmailLog from "../models/EmailLog";
import LeadGroupAssignment from "../models/LeadGroupAssignment";
import User from "../models/User.model";
import Template from "../models/Template";
import { sendEmail } from "../utils/sendEmail";

const sendEmails = async (req: Request, res: Response) => {
  const { campaignId } = req.params;

  try {
    // 1. Get Campaign
    const campaign:any = await Campaign.findByPk(campaignId, {
      include: [
        { model: Template, as: "Template" },
        { model: EmailLog, as: "EmailLogs" },
      ],
    });

    if (!campaign) {
       res.status(404).json({ message: "Campaign not found" });
    }

    // 2. Get users from lead group
    const leadAssignments = await LeadGroupAssignment.findAll({
      where: { groupId: campaign.leadGroupId },
      include: [{ model: User, as: "User" }],
    });

    const usersToEmail = leadAssignments
      .map((assign:any) => assign.User)
      .filter((user) => user && user.email);

    if (!usersToEmail.length) {
       res
        .status(400)
        .json({ message: "No users with emails found in lead group" });
    }

    // 3. Send emails and log results
    const logs: EmailLog[] = [];

    for (const user of usersToEmail) {
      try {
        const subject: string = campaign.campaignName;
        const html: string = campaign.Template?.html || "<p>No template</p>";
        const text: string = "You have a new campaign message.";

        await sendEmail({
        //   to: user.email,
        to : "success@simulator.amazonses.com",
          subject,
          bodyHtml: html,
          bodyText: text,
        //   from: campaign.fromEmail,
        from : "kayhanaudio@gmail.com"
        });

        const log = await EmailLog.create({
          campaign_id: campaign.id,
          email: user.email,
          status: "sent",
        });

        logs.push(log);
      } catch (err: any) {
        const log = await EmailLog.create({
          campaign_id: campaign.id,
          email: user.email,
          status: "failed",
          errorMessage: err.message || "Unknown error",
        });

        logs.push(log);
      }
    }

     res.json({
      message: "Emails processed",
      results: {
        sent: logs.filter((l) => l.status === "sent").length,
        failed: logs.filter((l) => l.status === "failed").length,
        total: logs.length,
      },
    });
  } catch (error) {
    console.error("Send campaign error:", error);
     res.status(500).json({ message: "Internal server error" });
  }
};

export { sendEmails };
