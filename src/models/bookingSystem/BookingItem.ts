import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class BookingItem extends Model<any> {
  public id!: number;
  public bookingId!: number;
  public itemType!: string;
  public otherItemText!: string;

  public readonly createdAt!: Date;
}

BookingItem.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    bookingId: { type: DataTypes.INTEGER, allowNull: false },
    itemType: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    otherItemText: { type: DataTypes.STRING(255), allowNull: true },
  },
  {
    sequelize,
    tableName: "booking_items",
    modelName: "BookingItem",
    timestamps: true,
    updatedAt: false,
  }
);

export default BookingItem;
