// models/Order.ts
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database";

import Channel from "./Channel";

interface OrderProduct {
  product_id: number;
  quantity: number;
}

interface OrderAttributes {
  id: number;
  channel_id: number;
  products: OrderProduct[]; // store product + quantity together
  total_amount: number;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface OrderCreationAttributes
  extends Optional<OrderAttributes, "id" | "status" | "total_amount"> {}

class Order
  extends Model<OrderAttributes, OrderCreationAttributes>
  implements OrderAttributes
{
  public id!: number;
  public channel_id!: number;
  public products!: OrderProduct[];
  public total_amount!: number;
  public status!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    channel_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    products: {
      type: DataTypes.JSON, 
      allowNull: false,
    },
    total_amount: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    sequelize,
    tableName: "orders",
    timestamps: true,
  }
);

// Association
Order.belongsTo(Channel, { foreignKey: "channel_id", as: "Channel" });

export default Order;
