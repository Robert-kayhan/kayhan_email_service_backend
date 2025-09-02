import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database";

interface FlyerAttributes {
  id: number;
  title: string;
  description?: string;
  productOneImageUrl?: string;
  productTwoImageUrl?: string;
  productSpecificationIdOne?: number;
  productSpecificationIdTwo?: number;

  // Add customer related fields here
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  installationFees?: string;
  deliveryFees?: string;
  quotationNumber?: string;
  validationTime?: string;
  flyer_url?: string;
  flyer_image_url?: string;
  CrmID?: string;


  createdAt?: Date;
  updatedAt?: Date;
}

type FlyerCreationAttributes = Optional<FlyerAttributes, "id">;

class Flyer
  extends Model<FlyerAttributes, FlyerCreationAttributes>
  implements FlyerAttributes
{
  public id!: number;
  public title!: string;
  public description?: string;
  public productOneImageUrl?: string;
  public productTwoImageUrl?: string;
  public productSpecificationIdOne?: number;
  public productSpecificationIdTwo?: number;

  public customerName?: string;
  public customerPhone?: string;
  public customerEmail?: string;
  public installationFees?: string;
  public deliveryFees?: string;
  public quotationNumber?: string;
  public validationTime?: string;
  public flyer_url?: string;
  public flyer_image_url?: string;
  public CrmID?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Flyer.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    productOneImageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    productTwoImageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    productSpecificationIdOne: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: "product_specifications",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    productSpecificationIdTwo: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: "product_specifications",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },

    // Add customer-related columns here
    customerName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customerPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customerEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    installationFees: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deliveryFees: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    quotationNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    validationTime: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    flyer_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    flyer_image_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
     CrmID: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "flyers",
    modelName: "Flyer",
  }
);

export default Flyer;
