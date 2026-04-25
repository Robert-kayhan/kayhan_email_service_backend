import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database";

interface CampaignScheduleAttributes {
  id: number;
  campaignId: number;
  scheduledAt: Date;
  status: "pending" | "processing" | "sent" | "failed" | "cancelled";
  isRecurring: boolean;
  recurrenceRule?: string | null;
  lastRunAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type CampaignScheduleCreationAttributes = Optional<
  CampaignScheduleAttributes,
  "id" | "status" | "isRecurring" | "recurrenceRule" | "lastRunAt"
>;

class CampaignSchedule
  extends Model<
    CampaignScheduleAttributes,
    CampaignScheduleCreationAttributes
  >
  implements CampaignScheduleAttributes
{
  public id!: number;
  public campaignId!: number;
  public scheduledAt!: Date;
  public status!: "pending" | "processing" | "sent" | "failed" | "cancelled";
  public isRecurring!: boolean;
  public recurrenceRule!: string | null;
  public lastRunAt!: Date | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CampaignSchedule.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    campaignId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    // ✅ FIXED: single status field
    status: {
      type: DataTypes.ENUM(
        "pending",
        "processing",
        "sent",
        "failed",
        "cancelled"
      ),
      defaultValue: "pending",
    },

    isRecurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    recurrenceRule: {
      type: DataTypes.STRING,
      allowNull: true, // cron format like "0 9 * * *"
    },

    lastRunAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "campaign_schedules",
    modelName: "CampaignSchedule",

    // ✅ Recommended indexes (important for cron performance)
    indexes: [
      {
        fields: ["status"],
      },
      {
        fields: ["scheduledAt"],
      },
      {
        fields: ["campaignId"],
      },
    ],
  }
);

export default CampaignSchedule;