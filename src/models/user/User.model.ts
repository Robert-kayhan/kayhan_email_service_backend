import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class User extends Model<any> {
  public id!: number;
  public firstname!: string;
  public lastname!: string;
  public email!: string;
  public phone!: string;

  public country!: string;
  public state!: string;
  public city!: string;
  public street!: string;
  public postcode!: string;

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
      defaultValue : "UNKNOWN USER"
    },
    lastname: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue : "UNKNOWN USER"
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    street: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    postcode: {
      type: DataTypes.STRING(20),
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
