import { Request, Response } from "express";
import LeadGroupAssignment from "../../models/crm/LeadGroupAssignment";
import Template from "../../models/compagin/Template";
import { sendEmail } from "../../utils/sendEmail";
import { v4 as uuidv4 } from "uuid";
import Campaign from "../../models/compagin/Campaign";
import EmailLog from "../../models/compagin/EmailLog";
import User from "../../models/user/User.model";


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
    // console.log(campaign)
    if (!campaign) {
       res.status(404).json({ message: "Campaign not found" });
       return
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
        return
    }

    const logs: EmailLog[] = [];

    for (const user of usersToEmail) {
      try {
        // 1. Generate unsubscribe token if not present
        if (!user.unsubscribeToken) {
          user.unsubscribeToken = uuidv4();
          await user.save();
        }

        // 2. Create log first
        const log = await EmailLog.create({
          campaign_id: campaign.id,
          email: user.email,
          status: "pending",
        });
        // console.log(user)
        // 3. Prepare email content
        const unsubscribeLink = `https://mailerapi.kayhanaudio.com.au/api/send-email/unsubscribe/?token=${user.unsubscribeToken}`;
        const pixelUrl = `https://mailerapi.kayhanaudio.com.au/api/send-email/open/?emailId=${log.id}`;
        console.log(unsubscribeLink)
        console.log(pixelUrl)
        const subject: string = `Hi ${user.firstname}, ${campaign.campaignName}`;

        const html: string = `
          <p>Hi ${user.firstname},</p>
          <p>${campaign.Template?.html || "You have a new update from Kayhan Audio."}</p>
          <hr />
          <p style="font-size:12px;color:#888;">
            Don’t want these emails? <a href="${unsubscribeLink}">Unsubscribe here</a>.
          </p>
          <img src="${pixelUrl}" width="1" height="1" style="display:none;" alt="tracking-pixel"/>
        `;

        const text: string = `Hi ${user.name},\nYou have a new update from Kayhan Audio.\nUnsubscribe: ${unsubscribeLink}`;

        console.log("📧 Sending to:", user.email);

        // 4. Send the email
        // console.log(campaign.fromEmail , "check this")
        const result = await sendEmail({
          to: user.email,
          subject,
          bodyHtml: html,
          bodyText: text,
          from: campaign.fromEmail, 
        });

        console.log("✅ Email sent:", result);

        // 5. Update log to sent
        await log.update({ status: "sent" });
        logs.push(log);
      } catch (err: any) {
        console.error("❌ Failed to send to", user.email, err);

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
  try {
    const { email, emailId } = req.query;

    if (!emailId) {
       res.status(400).json({ success: false, message: "emailId is required" });
       return
    }

    await EmailLog.update(
      { 
        // status: "opened",
        opened: true,
        openedAt: new Date(),
      },
      { where: { id: Number(emailId)} } // 👈 ensures matching email too
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating email log:", error);
     res.status(500).json({ success: false, error: "Internal server error" });
  }
};


const handleUnsubscribe = async (req: Request, res: Response) => {
  const { token } = req.query;

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
