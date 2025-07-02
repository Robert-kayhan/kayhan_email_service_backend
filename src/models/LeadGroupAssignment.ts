import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class LeadGroupAssignment extends Model {
  public id!: number;
  public userId!: number;
  public groupId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

LeadGroupAssignment.init(
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
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "LeadGroupAssignment",
    tableName: "lead_group_assignments",
    timestamps: true,
  }
);

export default LeadGroupAssignment;
