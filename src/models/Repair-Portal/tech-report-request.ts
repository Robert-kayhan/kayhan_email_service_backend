import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";
import User from "../user/User.model";


class TechSupport extends Model<any> {
  public id!: number;
  public userId!: number;

  public companyName!: string;
  public modelName!: string;
  public year!: number;
  public productName!: string;
  public reason!: string;
  public notes!: string;

  public status!: "pending" | "complete";
  public postMethod!: string;
  public trackingNumber!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TechSupport.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },

    companyName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    modelName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    productName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    orderNo: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue : "N/A"
    },
     notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue : ""
    },
    status: {
      type: DataTypes.ENUM("pending", "complete"),
      allowNull: false,
      defaultValue: "pending",
    },

    postMethod: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    trackingNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "tech_support",
    modelName: "TechSupport",
    timestamps: true,
  }
);

// Associations
User.hasMany(TechSupport, { foreignKey: "userId", as: "techSupportCases" });
TechSupport.belongsTo(User, { foreignKey: "userId", as: "user" });

export default TechSupport;
