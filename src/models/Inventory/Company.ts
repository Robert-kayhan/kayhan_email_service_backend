import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database"; // your sequelize instance

interface CompanyAttributes {
  id: number;
  name: string;
  description?: string;
  department_id?: number[]; // renamed to make it clear it's multiple
}

interface CompanyCreationAttributes extends Optional<CompanyAttributes, "id"> {}

class Company extends Model<CompanyAttributes, CompanyCreationAttributes>
  implements CompanyAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public department_id?: number[];

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Company.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    department_id: {
      type: DataTypes.JSON, // store multiple department IDs
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    sequelize,
    tableName: "companies",
    timestamps: true,
  }
);

// ❌ Remove associations because JSON column cannot be used with belongsTo / hasMany
// Company.belongsTo(Department, { foreignKey: "department_id", as: "Department" });
// Department.hasMany(Company, { foreignKey: "department_id", as: "Companies" });

export default Company;
