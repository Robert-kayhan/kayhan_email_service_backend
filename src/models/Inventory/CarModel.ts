// models/CarModel.ts
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database";
import Series from "./Series";

interface CarModelAttributes {
  id: number;
  name: string;
  seriesId: number; // foreign key to Series
  year: number;
  description?: string;
}

interface CarModelCreationAttributes extends Optional<CarModelAttributes, "id"> {}

class CarModel extends Model<CarModelAttributes, CarModelCreationAttributes>
  implements CarModelAttributes {
  public id!: number;
  public name!: string;
  public seriesId!: number;
  public year!: number;
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CarModel.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    seriesId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    year: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    tableName: "car_models",
    timestamps: true,
  }
);

// Relations
Series.hasMany(CarModel, { foreignKey: "seriesId", as: "models" });
CarModel.belongsTo(Series, { foreignKey: "seriesId", as: "series" });

export default CarModel;
