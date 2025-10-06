import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class Template extends Model {
  public id!: number;
  public name!: string;
  public type!: "Retail" | "wholeSale";
  public design!: object;  // stores Unlayer JSON
  public html!: string;    // stores rendered email HTML
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Template.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("Retail", "wholeSale"),
      defaultValue: "Retail",
    },
    design: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    html: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

  },
  {
    sequelize,
    modelName: "Template",
    tableName: "templates",
    timestamps: true,
    indexes: [{ fields: ["type"] }],
  }
);

export default Template;
