import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database"; // adjust path to your sequelize instance

interface CampaignAttributes {
  id: number;
  campaignName: string;
  fromEmail: string;
  senderName: string;
  templateId: number;
  leadGroupId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type CampaignCreationAttributes = Optional<CampaignAttributes, "id">;

class Campaign extends Model implements CampaignAttributes {
  public id!: number;
  public campaignName!: string;
  public campaignSubject!: string;
  public fromEmail!: string;
  public senderName!: string;
  public templateId!: number;
  public leadGroupId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Campaign.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    campaignName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    campaignSubject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fromEmail: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    senderName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    templateId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    leadGroupId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "campaigns",
    modelName: "Campaign",
  }
);

export default Campaign;
