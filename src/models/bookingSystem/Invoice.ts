// models/Invoice.ts
import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../config/database"; // your Sequelize instance

interface InvoiceAttributes {
  id: number;
  userId: number;
  bookingId: number;
  invoiceUrl: string; // link to generated invoice PDF
  bookingStatus: "Draft" | "Pending" | "Paid" | "Cancelled" | string; // allow string if needed
  createdAt?: Date;
  updatedAt?: Date;
}

// fields not required when creating
type InvoiceCreationAttributes = Optional<InvoiceAttributes, "id">;

export class Invoice
  extends Model<InvoiceAttributes, InvoiceCreationAttributes>
  implements InvoiceAttributes
{
  public id!: number;
  public userId!: number;
  public bookingId!: number;
  public invoiceUrl!: string;
  public bookingStatus!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Invoice.init(
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
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    invoiceUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bookingStatus: {
      type: DataTypes.ENUM("Draft", "Pending", "Paid", "Cancelled"),
      allowNull: false,
      defaultValue: "Pending",
    },
  },
  {
    sequelize,
    tableName: "invoices",
    modelName: "Invoice",
  }
);
