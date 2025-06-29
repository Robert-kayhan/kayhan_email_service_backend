import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";

class Template extends Model {
  public id!: number;
  public name!: string;
  public design!: object;  // stores Unlayer JSON
  public html!: string;    // stores rendered email HTML
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Template.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    design: {
      type: DataTypes.JSON,     // store full JSON design object
      allowNull: false,
    },
    html: {
      type: DataTypes.TEXT,     // long HTML string
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Template",
    tableName: "templates",
    timestamps: true, // createdAt and updatedAt
  }
);

export default Template;
