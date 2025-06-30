import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface EmailLogPerUserAttributes {
  id: number;
  userId: number;
  email: string;
  campaignIds: number[];       // array of campaign IDs
  lastSentAt?: Date;           // optional: last time this user received a campaign
}

interface EmailLogPerUserCreationAttributes
  extends Optional<EmailLogPerUserAttributes, "id" | "campaignIds" | "lastSentAt"> {}

class EmailLogPerUser
  extends Model<EmailLogPerUserAttributes, EmailLogPerUserCreationAttributes>
  implements EmailLogPerUserAttributes
{
  public id!: number;
  public userId!: number;
  public email!: string;
  public campaignIds!: number[];
  public lastSentAt?: Date;
}

EmailLogPerUser.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    campaignIds: {
      type: DataTypes.JSON, // Use ARRAY(DataTypes.INTEGER) if you’re using PostgreSQL
      allowNull: false,
      defaultValue: [],
    },
    lastSentAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "EmailLogPerUser",
    tableName: "EmailLogPerUser",
    timestamps: false,
  }
);

export default EmailLogPerUser;
