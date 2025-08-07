import sequelize from "../config/database";
import LeadFollowUp from "../models/LeadFolowUp";
import { setupAssociations } from "../models";

const connectDb = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");
    setupAssociations();
    sequelize.sync()
  // .then(() => {
  //   console.log("✅ DB altered successfully");
  // })
  // .catch((error) => {
  //   console.error("❌ Alter failed:", error);
  // });

  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
};

export default connectDb;
