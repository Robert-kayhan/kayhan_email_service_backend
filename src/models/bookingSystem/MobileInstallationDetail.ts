import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class MobileInstallationDetail extends Model<any> {
  public id!: number;
  public bookingId!: number;
  public parkingRestrictions!: string;
  public powerAccess!: string;
  public specialInstructions!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MobileInstallationDetail.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    bookingId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    parkingRestrictions: { type: DataTypes.TEXT, allowNull: true },
    powerAccess: { type: DataTypes.STRING(100), allowNull: true },
    specialInstructions: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    tableName: "mobile_installation_details",
    modelName: "MobileInstallationDetail",
    timestamps: true,
  }
);

export default MobileInstallationDetail;
