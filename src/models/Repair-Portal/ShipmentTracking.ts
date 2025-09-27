import { DataTypes } from "sequelize";
import RepairTicket from "./RepairTicket";
import sequelize from "../../config/database";

const ShipmentTracking = sequelize.define("ShipmentTracking", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  repair_ticket_id: { type: DataTypes.INTEGER, allowNull: false },

  // Type of shipment
  shipment_type: { 
    type: DataTypes.ENUM("ToRepairCenter", "ToCustomer"), 
    allowNull: false 
  },

  courier_name: { type: DataTypes.STRING },
  tracking_number: { type: DataTypes.STRING },
  
  status: {
    type: DataTypes.ENUM("Pending", "Shipped", "Delivered"),
    defaultValue: "Pending",
  },

  shipped_at: { type: DataTypes.DATE },
});

ShipmentTracking.belongsTo(RepairTicket, { foreignKey: "repair_ticket_id" });

export default ShipmentTracking;
