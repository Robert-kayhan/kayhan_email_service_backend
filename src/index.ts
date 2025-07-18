// src/index.ts
import express from "express";
import connectDb from "./db/connectDb";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config(); // ✅ Load env first

//routes
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import templateRoutes from "./routes/template.route";
import LeadGroupRoutes from "./routes/leadGroup.route";
import campaignRoutes from "./routes/Campaign.route";
import sendEmailroutes from "./routes/sendEmail.routes";

const app = express();
const PORT = process.env.PORT || 5002;

app.set("trust proxy", 1);

// ✅ Middleware order matters!
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://89.116.134.75:3000",
      "https://cravebuy.com",
    ],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api/auth/", authRoutes);
app.use("/api/users/", userRoutes);
app.use("/api/templates/", templateRoutes);
app.use("/api/lead-group/", LeadGroupRoutes);
app.use("/api/campaign/", campaignRoutes);
app.use("/api/send-email/", sendEmailroutes);

connectDb();

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT} 🚀`);
});
