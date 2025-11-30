// src/index.ts
import express from "express";
import connectDb from "./db/connectDb";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

//routes
//user
import authRoutes from "./routes/User/auth.routes";
import userRoutes from "./routes/User/user.routes";
//mailer
import templateRoutes from "./routes/compagin/template.route";
import LeadGroupRoutes from "./routes/compagin/leadGroup.route";
import LeadFolowUp from "./routes/crm/leadFollowUp.route";
import campaignRoutes from "./routes/compagin/Campaign.route";
import sendEmailroutes from "./routes/compagin/sendEmail.routes";
//flyer
import Specificationroutes from "./routes/flyer/Specification.routes";
import Flyerroutes from "./routes/flyer/flyer.routes";
import DashBoardRoutes from "./routes/dashboard.route";
//booking routes
import BOOKINGROutes from "./routes/booking-rotues/booking.routes";
import UploadRoutes from "./routes/upload.route";
import JobReportRoutes from "./routes/booking-rotues/jobReport.routes";
import invoiceRouter from "./routes/booking-rotues/Invoice.route";

//payments
import PaypalRouter from "./routes/payments/Paypal.route";
import ZipPayroutes from "./routes/payments/ZipPay.route";
import AfterPayRoutes from "./routes/payments/afterpay.route";

//inventory
import ChannelRoutes from "./routes/Inventory/Channel.route";
import Departmentroutes from "./routes/Inventory/department.route";
import ComapnyRoutes from "./routes/Inventory/Company.route";
import CarModelRoutes from "./routes/Inventory/carModel.route";
import ProductRoutes from "./routes/Inventory/product.route";
//repair
import RepairRoutes from "./routes/repair-return/repair.route";
import TechReportRequestRoutes from "./routes/repair-return/tech-report-request.route";
//automate
import { getProductFromCarAudioandKayhanAudio } from "./controllers/Inventory/product.controller";
import { getDepartmentFromCarAudioandKayhanAudio } from "./controllers/Inventory/Department.controller";
import cron from "node-cron";

import { companyFromCarAudioandKayhanAudio } from "./controllers/Inventory/Company.controller";
import { syncCarModelsWithLocalCompanies } from "./controllers/Inventory/CarModel.controller";

const app = express();
const PORT = process.env.PORT;

app.set("trust proxy", 1);

// ✅ Middleware order matters!
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://mailer.kayhanaudio.com.au",
      "https://kayhanaudio.com.au",
    ],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes

//user routes
app.use("/api/auth/", authRoutes);
app.use("/api/users/", userRoutes);

//mailer routes
app.use("/api/templates/", templateRoutes);
app.use("/api/lead-group/", LeadGroupRoutes);
app.use("/api/lead-follow-up/", LeadFolowUp);
app.use("/api/campaign/", campaignRoutes);
app.use("/api/send-email/", sendEmailroutes);
//flyer
app.use("/api/product-specifications", Specificationroutes);
app.use("/api/flyer", Flyerroutes);
//booking routes
app.use("/api/dashboard", DashBoardRoutes);
app.use("/api/booking", BOOKINGROutes);
app.use("/api/upload", UploadRoutes);
app.use("/api/job-report", JobReportRoutes);
app.use("/api/invoices", invoiceRouter);

//payments
app.use("/api/paypal", PaypalRouter);
app.use("/api/zip-pay", ZipPayroutes);
app.use("/api/after-pay", AfterPayRoutes);

//Invetory
app.use("/api/channel", ChannelRoutes);
app.use("/api/department", Departmentroutes);
app.use("/api/comapany", ComapnyRoutes);
app.use("/api/car-model", CarModelRoutes);
app.use("/api/product", ProductRoutes);

//repair and return

app.use("/api/repair-return", RepairRoutes);
app.use("/api/tech-support-request", TechReportRequestRoutes);

connectDb();

// ⏰ Run every 5 seconds
// cron.schedule("*/5 * * * * *", async () => {
//   console.log("⏰ Running product sync every 12 hours...");
//   getProductFromCarAudioandKayhanAudio();
//   getDepartmentFromCarAudioandKayhanAudio();
//   companyFromCarAudioandKayhanAudio();
//   syncCarModelsWithLocalCompanies()
// });

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT} 🚀`);
});
