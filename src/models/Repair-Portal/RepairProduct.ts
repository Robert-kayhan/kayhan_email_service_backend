import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

interface OrderProductAttributes {
  id?: number;
  order_id: string;
  customer_id?: number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;

  billing_address?: object;
  shipping_address?: object;

  products: object[];

  user_tracking_number?: string;
  user_post_method?: string;

  admin_tracking_number?: string;
  admin_post_method?: string;

  user_received_productImages?: string[];
  product_send_productImages?: string[];

  order_date?: Date;

  status?: "Not Reviewed" | "Reviewed" | "Not Received" | "Received";

  notes?: { text: string; createdAt: Date; by?: string }[];
}

class OrderProduct
  extends Model<OrderProductAttributes>
  implements OrderProductAttributes
{
  public id!: number;
  public order_id!: string;
  public customer_id?: number;
  public customer_name?: string;
  public customer_email?: string;
  public customer_phone?: string;

  public billing_address?: object;
  public shipping_address?: object;

  public products!: object[];

  public user_tracking_number?: string;
  public user_post_method?: string;

  public admin_tracking_number?: string;
  public admin_post_method?: string;

  public user_received_productImages?: string[];
  public product_send_productImages?: string[];

  public order_date?: Date;

  public status?: "Not Reviewed" | "Reviewed" | "Not Received" | "Received";

  public notes?: { text: string; createdAt: Date; by?: string }[];

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OrderProduct.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order_id: { type: DataTypes.STRING, allowNull: false, defaultValue: "N/A" },

    customer_name: { type: DataTypes.STRING, allowNull: true },
    customer_email: { type: DataTypes.STRING, allowNull: true },
    customer_phone: { type: DataTypes.STRING, allowNull: true },

    billing_address: { type: DataTypes.JSON, allowNull: true },
    shipping_address: { type: DataTypes.JSON, allowNull: true },

    products: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },

    user_tracking_number: { type: DataTypes.STRING, allowNull: true },
    user_post_method: { type: DataTypes.STRING, allowNull: true },

    admin_tracking_number: { type: DataTypes.STRING, allowNull: true },
    admin_post_method: { type: DataTypes.STRING, allowNull: true },

    user_received_productImages: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
    product_send_productImages: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },

    order_date: { type: DataTypes.DATE, allowNull: true },

    status: {
      type: DataTypes.ENUM(
        "Not Reviewed",
        "Reviewed",
        "Not Received",
        "Received"
      ),
      allowNull: false,
      defaultValue: "Not Reviewed",
    },

    notes: { type: DataTypes.JSON, allowNull: true, defaultValue: [] },
  },
  {
    sequelize,
    tableName: "OrderProducts",
    timestamps: true,
  }
);

export default OrderProduct;
