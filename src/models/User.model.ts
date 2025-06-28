import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import { UserAttributes } from "../utils/interface";

// Optional fields for creation


// Define the model class
class User extends Model<any> implements UserAttributes {
  public id!: number;
  public firstname!: string;
  public lastname!: string;
  public email!: string;
  public phone!: string;
  public password!: string;
  public address!: string;

  // timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize the model
User.init(
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
      unique: true,
    },
    phone: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    // password: {
    //   type: DataTypes.STRING(100),
    //   allowNull: false,
    // },
    address: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    role : {
       type: DataTypes.INTEGER,
      defaultValue : 0
    }
  },
  {
    sequelize,
    tableName: "users",
    modelName: "User",
    timestamps: true, // Set to false if not using createdAt, updatedAt
  }
);

export default User;
