import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class Booking extends Model<any> {
  public id!: number;
  public customerId!: number;
  public vehicleId!: number;
  public installationType!: "In-Store" | "Mobile";
  public invoiceNumber!: string;
  public preferredDate!: Date;
  public preferredTime!: string;
  public status!: "Pending" | "Confirmed" | "Completed" | "Cancelled";
  public notes!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Booking.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    customerId: { type: DataTypes.INTEGER, allowNull: false },
    vehicleId: { type: DataTypes.INTEGER, allowNull: false },
    type: {
      type: DataTypes.ENUM("In-Store", "Mobile"),
      allowNull: false,
    },
    invoiceNumber: { type: DataTypes.STRING(100), allowNull: true },
    date: { type: DataTypes.DATEONLY, allowNull: true },
    time: { type: DataTypes.TIME, allowNull: true },
    status: {
      type: DataTypes.ENUM("Pending", "Confirmed", "Completed", "Cancelled"),
      defaultValue: "Pending",
    },
    notes: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    tableName: "bookings",
    modelName: "Booking",
    timestamps: true,
  }
);

export default Booking;
