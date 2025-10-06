import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database";
import { UserAttributes } from "../../utils/interface";

// Optional fields for creation

// Define the model class
class Admin extends Model<any> {
  public id!: number;
  public firstname!: string;
  public lastname!: string;
  public email!: string;
  public phone!: string;
  public password!: string;

  // timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize the model
Admin.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstname: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lastname: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      // unique: true,
    },

    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "admins",
    modelName: "Admin",
    timestamps: true, // Set to false if not using createdAt, updatedAt
  }
);

export default Admin;
