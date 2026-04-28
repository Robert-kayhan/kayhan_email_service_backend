import cron from "node-cron";
import { Op } from "sequelize";
import CampaignSchedule from "../models/compagin/CampaignSchedule";
import Campaign from "../models/compagin/Campaign";
import Template from "../models/compagin/Template";
import EmailLog from "../models/compagin/EmailLog";
import LeadGroupAssignment from "../models/crm/LeadGroupAssignment";
import User from "../models/user/User.model";
import { sendEmail } from "../utils/sendEmail";
import { v4 as uuidv4 } from "uuid"

cron.schedule("* * * * *", async () => {
  console.log("⏰ Checking scheduled campaigns...");

  try {
    const now = new Date();

    const schedules = await CampaignSchedule.findAll({
      where: {
        status: "pending",
        scheduledAt: {
          [Op.lte]: now,
        },
      },
      include: [
        {
          model: Campaign,
          as: "campaign",
        },
      ],
    });

    for (const schedule of schedules) {
      try {
        console.log("🚀 Running campaign:", schedule.campaignId);

        // ✅ prevent duplicate execution
        await schedule.update({ status: "processing" });

        // ✅ send emails using your existing logic
        await processCampaignEmailsService(schedule.campaignId);

        // ✅ mark completed
        await schedule.update({
          status: "sent",
          lastRunAt: new Date(),
        });

        console.log("✅ Campaign sent:", schedule.campaignId);
      } catch (err) {
        console.error("❌ Failed schedule:", schedule.id, err);

        await schedule.update({
          status: "failed",
        });
      }
    }
  } catch (err) {
    console.error("❌ Scheduler error:", err);
  }
});



export const processCampaignEmailsService = async (campaignId: number) => {
  const campaign: any = await Campaign.findByPk(campaignId, {
    include: [
      { model: Template, as: "Template" },
      { model: EmailLog, as: "EmailLogs" },
    ],
  });

  if (!campaign) throw new Error("Campaign not found");

  const leadAssignments = await LeadGroupAssignment.findAll({
    where: { groupId: campaign.leadGroupId },
    include: [{ model: User, as: "User" }],
  });

  const usersToEmail = leadAssignments
    .map((assign: any) => assign.User)
    .filter((user) => user && user.email && user.isSubscribed);

  if (!usersToEmail.length) {
    return {
      sent: 0,
      failed: 0,
      total: 0,
      message: "No users with emails found in lead group",
    };
  }

  let sent = 0;
  let failed = 0;

  for (const user of usersToEmail) {
    try {
      if (!user.unsubscribeToken) {
        user.unsubscribeToken = uuidv4();
        await user.save();
      }

      const log = await EmailLog.create({
        campaign_id: campaign.id,
        email: user.email,
        status: "pending",
      });

      const unsubscribeLink = `https://mailerapi.kayhanaudio.com.au/api/send-email/unsubscribe/?token=${user.unsubscribeToken}`;
      const pixelUrl = `https://mailerapi.kayhanaudio.com.au/api/send-email/open/?emailId=${log.id}`;

      const subject = `Hi ${user.firstname}, ${campaign.campaignName}`;

      const html = `
        <p>Hi ${user.firstname},</p>
        <p>${campaign.Template?.html || "You have a new update from Kayhan Audio."}</p>
        <hr />
        <p style="font-size:12px;color:#888;">
          Don’t want these emails? <a href="${unsubscribeLink}">Unsubscribe here</a>.
        </p>
        <img src="${pixelUrl}" width="1" height="1" style="display:none;" />
      `;

      const text = `Hi ${user.firstname},
You have a new update from Kayhan Audio.
Unsubscribe: ${unsubscribeLink}`;

      await sendEmail({
        to: user.email,
        subject,
        bodyHtml: html,
        bodyText: text,
        from: campaign.fromEmail,
      });

      await log.update({ status: "sent" });
      sent++;
    } catch (err: any) {
      await EmailLog.create({
        campaign_id: campaign.id,
        email: user.email,
        status: "failed",
        errorMessage: err.message || "Unknown error",
      });
      failed++;
    }
  }

  return {
    sent,
    failed,
    total: sent + failed,
    message: "Emails processed",
  };
};