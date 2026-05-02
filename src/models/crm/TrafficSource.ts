import { DataTypes } from "sequelize";
import sequelize from "../../config/database";

const TrafficSource = sequelize.define("TrafficSource", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  utm_source: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  utm_medium: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  utm_campaign: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  utm_term: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  utm_content: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  referrer: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  landing_page: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

export default TrafficSource;