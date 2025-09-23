// models/Department.ts
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database"; // your sequelize instance

// Department attributes
interface DepartmentAttributes {
  id: number;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// For creation, id, createdAt, updatedAt are optional
interface DepartmentCreationAttributes extends Optional<DepartmentAttributes, "id" | "createdAt" | "updatedAt"> {}

class Department extends Model<DepartmentAttributes, DepartmentCreationAttributes>
  implements DepartmentAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Department.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "departments",
    timestamps: true, // enables createdAt & updatedAt automatically
  }
);

export default Department;
