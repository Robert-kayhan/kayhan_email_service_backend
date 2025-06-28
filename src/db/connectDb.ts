import sequelize from "../config/database";

const connectDb = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");

    // await sequelize.sync({ alter: true }); // Auto sync models with DB
    console.log("✅ All models were synchronized successfully.");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
};

export default connectDb;
