// src/models/Version.ts
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database";

interface VersionAttributes {
  id: number;
  name: string;
  description?: string;

  status: number;
  created_by: number;
  edit_by?: number;

  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

type VersionCreationAttributes = Optional<
  VersionAttributes,
  "id" | "description" | "status" | "edit_by" | "created_at" | "updated_at" | "deleted_at"
>;

class Version
  extends Model<VersionAttributes, VersionCreationAttributes>
  implements VersionAttributes
{
  public id!: number;
  public name!: string;
  public description?: string;

  public status!: number;
  public created_by!: number;
  public edit_by?: number;

  public created_at!: Date;
  public updated_at!: Date;
  public deleted_at?: Date;
}

Version.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },

    created_by: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    edit_by: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
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
    tableName: "versions",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

export default Version;