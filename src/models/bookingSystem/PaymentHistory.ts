import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

class PaymentHistory extends Model {
  public id!: number;
  public paymentId!: number;
  public paidAmount!: number;
  public status!: "Pending" | "Completed" | "Cancelled";
  public readonly createdAt!: Date; // timestamp of the payment update
}

PaymentHistory.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    paymentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "payments", key: "id" },
      onDelete: "CASCADE",
    },
    paidAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Pending", "Completed", "Cancelled"),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "payment_histories",
    modelName: "PaymentHistory",
    timestamps: true,  // createdAt is automatically stored
    updatedAt: false,  // no updatedAt needed
  }
);

export default PaymentHistory;
