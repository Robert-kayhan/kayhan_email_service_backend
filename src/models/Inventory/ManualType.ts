import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database";

interface ManualTypeAttributes {
  id: number;
  name: string;
  slug: string;
  status: number;
}

type ManualTypeCreationAttributes = Optional<
  ManualTypeAttributes,
  "id" | "status"
>;

class ManualType
  extends Model<ManualTypeAttributes, ManualTypeCreationAttributes>
  implements ManualTypeAttributes
{
  public id!: number;
  public name!: string;
  public slug!: string;
  public status!: number;
}

ManualType.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: "manual_types",
    timestamps: true,
    paranoid: true,
    underscored: true,

    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",

  
  }
);

export default ManualType;