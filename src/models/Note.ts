// models/LeadNote.ts

import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

class LeadNote extends Model {}

LeadNote.init(
  {
    leadFollowUpId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "LeadNote",
    tableName: "lead_notes",
    timestamps: true,
  }
);

export default LeadNote;
