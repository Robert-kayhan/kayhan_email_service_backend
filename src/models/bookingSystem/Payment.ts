import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";
import Booking from "./Booking";

class Payment extends Model<any> {
  public id!: number;
  public bookingId!: number;
  public category!: "Instant" | "Later";
  public methods!: string[]; // store as JSON
  public type!: "Full" | "Partial";
  public partialAmount!: number | null;

  public totalAmount!: number; // final amount after discount
  public paidAmount!: number;

  public discountType!: "amount" | "percentage";
  public discountValue!: number; // value of discount
  public discountAmount!: number; // calculated discount

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Virtual field for remaining payment
  public get remainingAmount(): number {
    return parseFloat((this.totalAmount - this.paidAmount).toFixed(2));
  }
}

Payment.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "bookings", key: "id" },
      onDelete: "CASCADE",
    },

    category: {
      type: DataTypes.ENUM("Instant", "Later"),
      allowNull: false,
      defaultValue: "Instant",
    },
    status: {
      type: DataTypes.ENUM("Pending", "Completed", "Cancelled"),
      defaultValue: "Pending",
    },
    methods: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    type: {
      type: DataTypes.ENUM("Full", "Partial"),
      allowNull: false,
      defaultValue: "Full",
    },
    partialAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    paidAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    discountType: {
      type: DataTypes.ENUM("amount", "percentage"),
      allowNull: false,
      defaultValue: "amount",
    },
    discountValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "payments",
    modelName: "Payment",
    timestamps: true,
  }
);

// Associations
Booking.hasOne(Payment, { foreignKey: "bookingId", as: "payment" });
Payment.belongsTo(Booking, { foreignKey: "bookingId", as: "booking" });

export default Payment;
