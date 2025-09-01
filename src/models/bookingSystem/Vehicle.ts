import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class Vehicle extends Model<any> {
  public id!: number;
  public customerId!: number;
  public make!: string;
  public model!: string;
  public year!: number;
  public vinNumber!: string;
  public currentStereo!: string;
  public dashPhotosUrl!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Vehicle.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    customerId: { type: DataTypes.INTEGER, allowNull: false },
    make: { type: DataTypes.STRING(100), allowNull: true },
    model: { type: DataTypes.STRING(100), allowNull: true },
    year: { type: DataTypes.INTEGER, allowNull: true },
    vinNumber: { type: DataTypes.STRING(50), allowNull: true },
    currentStereo: { type: DataTypes.STRING(150), allowNull: true },
    dashPhotosUrl: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    tableName: "vehicles",
    modelName: "Vehicle",
    timestamps: true,
  }
);

export default Vehicle;
