import cron from "node-cron";
import { Op } from "sequelize";
import CampaignSchedule from "../models/compagin/CampaignSchedule";
import Campaign from "../models/compagin/Campaign";
import { processCampaignEmails } from "../controllers/compagin/email.controller";

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
        await processCampaignEmails(schedule.campaignId);

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