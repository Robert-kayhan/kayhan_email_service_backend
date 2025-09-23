// models/Series.ts
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database";
import Department from "./Department";

interface SeriesAttributes {
  id: number;
  name: string;
  departmentId: number; // foreign key to Department
  description?: string;
}

interface SeriesCreationAttributes extends Optional<SeriesAttributes, "id"> {}

class Series extends Model<SeriesAttributes, SeriesCreationAttributes>
  implements SeriesAttributes {
  public id!: number;
  public name!: string;
  public departmentId!: number;
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Series.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    departmentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    tableName: "series",
    timestamps: true,
  }
);

// Relations
Department.hasMany(Series, { foreignKey: "departmentId", as: "series" });
Series.belongsTo(Department, { foreignKey: "departmentId", as: "department" });

export default Series;
