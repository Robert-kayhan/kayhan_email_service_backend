import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import { UserAttributes } from "../utils/interface";

class User extends Model<any>  {
  public id!: number;
  public firstname!: string;
  public lastname!: string;
  public email!: string;
  public phone!: string;
  public address!: string;
  public role!: number;
  public isSubscribed!: boolean;
  public unsubscribeToken!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

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
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    role: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
     isSubscribed: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, 
    },
    unsubscribeToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  },
  {
    sequelize,
    tableName: "users",
    modelName: "User",
    timestamps: true,
  }
);

export default User;
