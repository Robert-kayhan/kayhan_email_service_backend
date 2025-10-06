import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class LeadGroup extends Model {
  public id!: number;
  public groupName!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

LeadGroup.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    groupName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "LeadGroup",
    tableName: "lead_groups",
    timestamps: true,
  }
);

export default LeadGroup;
