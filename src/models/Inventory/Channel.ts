import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../../config/database"; // adjust path

// Channel attributes
interface ChannelAttributes {
  id: number;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// For creating new channel (id is auto-generated)
interface ChannelCreationAttributes extends Optional<ChannelAttributes, "id"> {}

class Channel
  extends Model<ChannelAttributes, ChannelCreationAttributes>
  implements ChannelAttributes
{
  public id!: number;
  public name!: string;
  public description?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Channel.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Channel",
    tableName: "channels",
    timestamps: true,
  }
);

export default Channel;
