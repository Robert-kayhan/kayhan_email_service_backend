import sequelize from "../config/database";

const connectDb = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");

    sequelize.sync().then(() => {
      console.log("✅ Database synced");
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
};

export default connectDb;
