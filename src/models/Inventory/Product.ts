// models/Product.ts
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database";

import CarModel from "./CarModel";
import Company from "./Company";
import Channel from "./Channel";
import Department from "./Department";

interface ProductAttributes {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;

  car_model_id?: number; 
  company_id?: number;
  channel_id?: number;   
  department_id?: number;

  createdAt?: Date;
  updatedAt?: Date;
}

// For creation
interface ProductCreationAttributes
  extends Optional<ProductAttributes, "id"> {}

class Product
  extends Model<ProductAttributes, ProductCreationAttributes>
  implements ProductAttributes
{
  public id!: number;
  public name!: string;
  public description?: string;
  public price!: number;
  public stock!: number;

  public car_model_id?: number;
  public company_id?: number;
  public channel_id?: number;
  public department_id?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    car_model_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    company_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    channel_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    department_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "products",
    timestamps: true,
  }
);

/* ---------------- Associations ---------------- */
Product.belongsTo(CarModel, { foreignKey: "car_model_id", as: "CarModel" });
CarModel.hasMany(Product, { foreignKey: "car_model_id", as: "Products" });

Product.belongsTo(Company, { foreignKey: "company_id", as: "Company" });
Company.hasMany(Product, { foreignKey: "company_id", as: "Products" });

Product.belongsTo(Channel, { foreignKey: "channel_id", as: "Channel" });
Channel.hasMany(Product, { foreignKey: "channel_id", as: "Products" });

// Optional: Direct link to Department too
Product.belongsTo(Department, { foreignKey: "department_id", as: "Department" });
Department.hasMany(Product, { foreignKey: "department_id", as: "Products" });

export default Product;
