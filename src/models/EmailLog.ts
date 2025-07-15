// models/EmailLog.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database"; // Adjust based on your setup

class EmailLog extends Model {
  public id!: number;
  public email!: string;
  public status!: "sent" | "failed";
  public errorMessage?: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

EmailLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    campaign_id : {
      type : DataTypes.INTEGER.UNSIGNED
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("sent", "failed"),
      allowNull: false,
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
  }
);

export default EmailLog;
