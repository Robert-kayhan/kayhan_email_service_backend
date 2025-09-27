import { DataTypes } from "sequelize";
import RepairTicket from "./RepairTicket";
import sequelize from "../../config/database";

const RepairPart = sequelize.define("RepairPart", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  repair_ticket_id: { type: DataTypes.INTEGER, allowNull: false },
  part_id: { type: DataTypes.INTEGER, allowNull: false }, // links to InventoryPart
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
});

RepairPart.belongsTo(RepairTicket, { foreignKey: "repair_ticket_id" });

export default RepairPart;
