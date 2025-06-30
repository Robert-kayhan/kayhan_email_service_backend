import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import EmailTemplate from "./Template";
import EmailCampaignRecipient from "./EmailLogPerUser"; // ⬅️ Import the new model

interface EmailCampaignAttributes {
  id: number;
  name: string;
  subject: string;
  templateId: number;
  status: "draft" | "scheduled" | "sent";
  scheduledAt?: Date;
  sentAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface EmailCampaignCreationAttributes
  extends Optional<EmailCampaignAttributes, "id" | "status" | "scheduledAt" | "sentAt"> {}

class Campaign
  extends Model<EmailCampaignAttributes, EmailCampaignCreationAttributes>
  implements EmailCampaignAttributes
{
  public id!: number;
  public name!: string;
  public subject!: string;
  public templateId!: number;
  public status!: "draft" | "scheduled" | "sent";
  public scheduledAt?: Date;
  public sentAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Campaign.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    templateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "EmailTemplates",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("draft", "scheduled", "sent"),
      allowNull: false,
      defaultValue: "draft",
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "EmailCampaign",
    tableName: "EmailCampaigns",
    timestamps: true,
  }
);

// Set associations
Campaign.belongsTo(EmailTemplate, {
  foreignKey: "templateId",
  as: "template",
});

// ✅ Add the new relation
Campaign.hasMany(EmailCampaignRecipient, {
  foreignKey: "campaignId",
  as: "recipients",
});

export default Campaign;
