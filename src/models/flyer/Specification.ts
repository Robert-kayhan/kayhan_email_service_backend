import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database";

interface ProductSpecificationAttributes {
  id: number;
  name?: string;
  processor?: string;
  operatingSystem?: string;
  memory?: string;
  wirelessCarPlayAndroidAuto?: string;
  audioVideoOutput?: string;
  amplifier?: string;
  cameraInputs?: string;
  microphone?: string;
  bluetooth?: string;
  usbPorts?: string;
  steeringWheelACControls?: string;
  factoryReversingCamera?: string;
  audioVideoFeatures?: string;
  radioTuner?: string;
  googlePlayStore?: string;
  netflix?: string;
  disneyPlus?: string;
  foxtel?: string;
  apps?: string;
  screenSize?: string;
  screenResolution?: string;
  onlineVideos?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type ProductSpecificationCreationAttributes = Optional<ProductSpecificationAttributes, "id">;

class ProductSpecification
  extends Model<ProductSpecificationAttributes, ProductSpecificationCreationAttributes>
  implements ProductSpecificationAttributes
{
  public id!: number;
  public name?: string;
  public processor?: string;
  public operatingSystem?: string;
  public memory?: string;
  public wirelessCarPlayAndroidAuto?: string;
  public audioVideoOutput?: string;
  public amplifier?: string;
  public cameraInputs?: string;
  public microphone?: string;
  public bluetooth?: string;
  public usbPorts?: string;
  public steeringWheelACControls?: string;
  public factoryReversingCamera?: string;
  public audioVideoFeatures?: string;
  public radioTuner?: string;
  public googlePlayStore?: string;
  public netflix?: string;
  public disneyPlus?: string;
  public foxtel?: string;
  public apps?: string;
  public screenSize?: string;
  public screenResolution?: string;
  public onlineVideos?: string;

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
    processor: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    operatingSystem: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    memory: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    wirelessCarPlayAndroidAuto: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    audioVideoOutput: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    amplifier: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    cameraInputs: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    microphone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bluetooth: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    usbPorts: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    steeringWheelACControls: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    factoryReversingCamera: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    audioVideoFeatures: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    radioTuner: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    googlePlayStore: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    netflix: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    disneyPlus: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    foxtel: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    apps: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    screenSize: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    screenResolution: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    onlineVideos: {
      type: DataTypes.STRING,
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
