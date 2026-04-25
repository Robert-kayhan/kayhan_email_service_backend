import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database";

interface EmailLogAttributes {
  id: number;
  campaign_id: number;
  userId?: number | null;
  email: string;

  status: "pending" | "sent" | "failed";

  opened: boolean;
  openedAt?: Date | null;

  clicked: boolean;
  clickedAt?: Date | null;
  clickCount: number;

  errorMessage?: string | null;

  createdAt?: Date;
  updatedAt?: Date;
}

type EmailLogCreationAttributes = Optional<
  EmailLogAttributes,
  | "id"
  | "status"
  | "opened"
  | "openedAt"
  | "clicked"
  | "clickedAt"
  | "clickCount"
  | "errorMessage"
  | "userId"
>;

class EmailLog
  extends Model<EmailLogAttributes, EmailLogCreationAttributes>
  implements EmailLogAttributes
{
  public id!: number;
  public campaign_id!: number;
  public userId!: number | null;
  public email!: string;

  public status!: "pending" | "sent" | "failed";

  public opened!: boolean;
  public openedAt!: Date | null;

  public clicked!: boolean;
  public clickedAt!: Date | null;
  public clickCount!: number;

  public errorMessage!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

EmailLog.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    campaign_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "campaigns",
        key: "id",
      },
      onDelete: "CASCADE",
    },

    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true, // optional but recommended
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("pending", "sent", "failed"),
      allowNull: false,
      defaultValue: "pending",
    },

    opened: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    openedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    clicked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    clickedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    clickCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "email_logs",
    modelName: "EmailLog",

    indexes: [
      {
        fields: ["campaign_id"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["email"],
      },
    ],
  }
);

export default EmailLog;