import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database";

// Define attributes
interface MobileInstallationDetailAttributes {
  id: number;
  bookingId: number;
  parkingRestrictions?: string;
  powerAccess?: string;
  specialInstructions?: string;
  pickupAddress?: string;
  pickupLat?: number;
  pickupLng?: number;
  dropoffAddress?: string;
  dropoffLat?: number;
  dropoffLng?: number;
  routeDistance?: string; // "12.5 km"
  routeDuration?: string; // "25 mins"
  routePolyline?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Allow partial input on creation
interface MobileInstallationDetailCreationAttributes
  extends Optional<MobileInstallationDetailAttributes, "id"> {}

class MobileInstallationDetail
  extends Model<
    MobileInstallationDetailAttributes,
    MobileInstallationDetailCreationAttributes
  >
  implements MobileInstallationDetailAttributes
{
  public id!: number;
  public bookingId!: number;
  public parkingRestrictions!: string;
  public powerAccess!: string;
  public specialInstructions!: string;
  public pickupAddress!: string;
  public pickupLat!: number;
  public pickupLng!: number;
  public dropoffAddress!: string;
  public dropoffLat!: number;
  public dropoffLng!: number;
  public routeDistance!: string;
  public routeDuration!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MobileInstallationDetail.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    bookingId: { type: DataTypes.INTEGER, allowNull: false, unique: true },

    // Installation details
    parkingRestrictions: { type: DataTypes.TEXT, allowNull: true },
    powerAccess: { type: DataTypes.STRING(100), allowNull: true },
    specialInstructions: { type: DataTypes.TEXT, allowNull: true },

    // Route details
    pickupAddress: { type: DataTypes.STRING, allowNull: true },
    pickupLat: { type: DataTypes.FLOAT, allowNull: true },
    pickupLng: { type: DataTypes.FLOAT, allowNull: true },
    dropoffAddress: { type: DataTypes.STRING, allowNull: true },
    dropoffLat: { type: DataTypes.FLOAT, allowNull: true },
    dropoffLng: { type: DataTypes.FLOAT, allowNull: true },
    routeDistance: { type: DataTypes.STRING, allowNull: true },
    routeDuration: { type: DataTypes.STRING, allowNull: true },
    routePolyline: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    tableName: "mobile_installation_details",
    modelName: "MobileInstallationDetail",
    timestamps: true,
  }
);

export default MobileInstallationDetail;
