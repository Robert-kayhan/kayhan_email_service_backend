import { Request, Response } from "express";
import Campaign from "../models/Campaign";
import EmailLog from "../models/EmailLog";
import LeadGroupAssignment from "../models/LeadGroupAssignment";
import User from "../models/User.model";
import Template from "../models/Template";
import { sendEmail } from "../utils/sendEmail";
import { v4 as uuidv4 } from "uuid";

const sendEmails = async (req: Request, res: Response) => {
  const { campaignId } = req.params;

  try {
    // 1. Get Campaign
    const campaign: any = await Campaign.findByPk(campaignId, {
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
      .map((assign: any) => assign.User)
      .filter((user) => user && user.email && user.isSubscribed);

    if (!usersToEmail.length) {
      res
        .status(400)
        .json({ message: "No users with emails found in lead group" });
    }

    // 3. Send emails and log results
    const logs: EmailLog[] = [];

    for (const user of usersToEmail) {
      try {
        // 1. Generate unsubscribe token if not present
        if (!user.unsubscribeToken) {
          user.unsubscribeToken = uuidv4();
          await user.save();
        }

        // 2. Create log first so you can use log.id in tracking pixel
        const log = await EmailLog.create({
          campaign_id: campaign.id,
          email: user.email,
          status: "pending", // temporary status, will update later
        });

        // 3. Prepare email content
        const unsubscribeLink = `https://mailerapi.kayhanaudio.com.au/api/send-email/unsubscribe/?token=${user.unsubscribeToken}`;
        const pixelUrl = `https://mailerapi.kayhanaudio.com.au/api/send-email/open/?emailId=${log.id}`;
        const subject: string = campaign.campaignName;
        let html: string = campaign.Template?.html || "<p>No template</p>";
        const text: string = "You have a new campaign message.";

        // 4. Append unsubscribe link + tracking pixel
        html += `
            <hr />
            <p style="font-size: 12px; color: #888;">
              Don’t want these emails?
              <a href="${unsubscribeLink}">Unsubscribe here</a>.
            </p>
            <img 
              src="${pixelUrl}" 
              width="1" 
              height="1" 
              style="display: none;" 
              alt="tracking-pixel"
            />
          `;

        console.log("📧 Sending to:", user.email);

        // 5. Send the email
        const result = await sendEmail({
          to: user.email,
          subject,
          bodyHtml: html,
          bodyText: text,
          from: "noreply@mailer.kayhanaudio.com.au",
        });

        console.log("✅ Email sent:", result);

        // 6. Update log to sent
        await log.update({ status: "sent" });

        logs.push(log);
      } catch (err: any) {
        console.error("❌ Failed to send to", user.email, err);

        // Fallback: create log only if it failed before log was created
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

const checkUserOpenEmail = async (req: Request, res: Response) => {
  const { campaignId, email } = req.params;
  try {
    await EmailLog.update(
      { opened: true, openedAt: new Date() },
      { where: { campaign_id: campaignId, email } }
    );
  } catch (error) {
    console.log("error message", error);
  }
};

const handleUnsubscribe = async (req: Request, res: Response) => {
  const { token } = req.body;

  const user = await User.findOne({ where: { unsubscribeToken: token } });

  if (!user) {
    res.status(404).json({ message: "Invalid unsubscribe token" });
    return;
  }

  user.isSubscribed = false;
  await user.save();

  res.json({ message: "Successfully unsubscribed." });
};

export { sendEmails, checkUserOpenEmail, handleUnsubscribe };
