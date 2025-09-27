import { DataTypes } from "sequelize";
import User from "../User.model";
import sequelize from "../../config/database";
const RepairTicket = sequelize.define("RepairTicket", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  rma_id: { type: DataTypes.STRING, unique: true }, // RMA number
  order_id: { type: DataTypes.STRING, allowNull: false }, // reference to external order
  customer_id: { type: DataTypes.INTEGER, allowNull: false }, // reference to Customer
  serial_no: { type: DataTypes.STRING },
  model: { type: DataTypes.STRING },
  status: {
    type: DataTypes.ENUM(
      "Received",
      "Diagnosing",
      "Waiting for Parts",
      "Repair in Progress",
      "Quality Check",
      "Completed",
      "Shipped"
    ),
    defaultValue: "Received",
  },
  problem_reported: { type: DataTypes.TEXT },
  diagnosis: { type: DataTypes.TEXT },
  cause: { type: DataTypes.TEXT },
  resolution: { type: DataTypes.TEXT },
  warranty_status: { type: DataTypes.ENUM("In Warranty", "Out of Warranty") },
  estimated_cost: { type: DataTypes.DECIMAL(10, 2) },
  final_cost: { type: DataTypes.DECIMAL(10, 2) },
  payment_order_number: { type: DataTypes.STRING },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

RepairTicket.belongsTo(User, { foreignKey: "customer_id" });

export default RepairTicket;
