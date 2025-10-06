import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class CarModel extends Model {
  public id!: number;
  public parent_id?: number;
  public company_id!: number;
  public name!: string;
  public description?: string;
  public created_by!: number;
  public edit_by?: number;
  public status!: number;
  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at?: Date;
}

CarModel.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,   // ✅ UNSIGNED ID
      autoIncrement: true,
      primaryKey: true,
    },
    parent_id: {
      type: DataTypes.INTEGER.UNSIGNED,   // ✅ must also be UNSIGNED
      allowNull: true,
      references: {
        model: "car_models",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    company_id: {
      type: DataTypes.INTEGER.UNSIGNED,   // keep consistency for FKs
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    created_by: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    edit_by: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "car_models",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

export default CarModel;
