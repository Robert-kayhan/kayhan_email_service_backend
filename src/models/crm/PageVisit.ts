import { DataTypes } from "sequelize";
import sequelize from "../../config/database";

const PageVisit = sequelize.define("PageVisit", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  ip_address: {
    type: DataTypes.STRING,
  },

  user_agent: {
    type: DataTypes.TEXT,
  },

  url: {
    type: DataTypes.TEXT,
  },

  path: {
    type: DataTypes.STRING,
  },

  visited_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

export default PageVisit;