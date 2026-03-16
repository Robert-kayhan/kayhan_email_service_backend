import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database";

interface SpecificationItem {
  title: string;
  description: string;
  image?: string;
}

interface ProductSpecificationAttributes {
  id: number;
  name?: string;
  specifications?: SpecificationItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

type ProductSpecificationCreationAttributes = Optional<
  ProductSpecificationAttributes,
  "id"
>;

class ProductSpecification
  extends Model<
    ProductSpecificationAttributes,
    ProductSpecificationCreationAttributes
  >
  implements ProductSpecificationAttributes
{
  public id!: number;
  public name?: string;
  public specifications?: SpecificationItem[];

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ProductSpecification.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    specifications: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "product_specifications",
    modelName: "ProductSpecification",
  }
);

export default ProductSpecification;