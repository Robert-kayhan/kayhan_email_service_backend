// src/models/Inventory/UserManual.ts
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database";

interface UserManualAttributes {
  id: number;

  company_id: number;

  model_id: number;               // ✅ main model id (parent)
  sub_model_id?: number | null;   // ✅ optional submodel id (child)

  // ✅ NEW: manual type (optional)
  manual_type_id?: number | null;

  from_year: number;
  to_year: number;
  version_id?: number | null;

  title: string;
  slug: string;
  content: string;

  cover_image?: string | null;

  status: number;
  created_by: number;
  edit_by?: number | null;

  // ✅ Sequelize manages these because timestamps/paranoid are enabled:
  // created_at, updated_at, deleted_at (do NOT declare them manually)
}

type UserManualCreationAttributes = Optional<
  UserManualAttributes,
  | "id"
  | "sub_model_id"
  | "manual_type_id"
  | "version_id"
  | "cover_image"
  | "status"
  | "edit_by"
>;

class UserManual
  extends Model<UserManualAttributes, UserManualCreationAttributes>
  implements UserManualAttributes
{
  public id!: number;

  public company_id!: number;

  public model_id!: number;
  public sub_model_id?: number | null;

  public manual_type_id?: number | null;

  public from_year!: number;
  public to_year!: number;
  public version_id?: number | null;

  public title!: string;
  public slug!: string;
  public content!: string;

  public cover_image?: string | null;

  public status!: number;
  public created_by!: number;
  public edit_by?: number | null;

  // ✅ Sequelize will add:
  // public readonly createdAt!: Date;
  // public readonly updatedAt!: Date;
  // public readonly deletedAt!: Date | null;
}

UserManual.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    company_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: "companies", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },

    // ✅ Main model (required)
    model_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: "car_models", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },

    // ✅ Submodel (optional)
    sub_model_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: "car_models", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },

    // ✅ NEW: Manual type (optional)
    manual_type_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: "manual_types", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },

    from_year: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
      validate: { min: 1950, max: 2100 },
    },

    to_year: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
      validate: { min: 1950, max: 2100 },
    },

    version_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: { model: "versions", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    cover_image: {
      type: DataTypes.STRING,
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
  },
  {
    sequelize,
    tableName: "user_manuals",

    timestamps: true,
    paranoid: true,
    underscored: true,

    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",


  }
);

export default UserManual;