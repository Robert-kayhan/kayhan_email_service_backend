import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class LeadSalesTracking extends Model {
  public id!: number;
  public lead_id!: number;

  public is_quotation!: boolean;
  public quotation_number!: string | null;
  public quotation_send_date!: Date | null;

  public is_invoice!: boolean;
  public invoice_number!: string | null;
  public invoice_send_date!: Date | null;

  public sale_status!: "pending" | "won" | "lost" | "followup";
  public sale_status_update_date!: Date | null;

  public source!: string | null;

  // timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

LeadSalesTracking.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    lead_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    is_quotation: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    quotation_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    quotation_send_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_invoice: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    invoice_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    invoice_send_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sale_status: {
      type: DataTypes.ENUM("Sale not done","Sale done"),
      defaultValue: "Sale not done",
    },
    sale_status_update_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    source: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "lead_sales_tracking",
    modelName: "LeadSalesTracking",
    timestamps: true,
  }
);

export default LeadSalesTracking;
