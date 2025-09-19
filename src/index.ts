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
import LeadFolowUp from "./routes/leadFollowUp.route";
import campaignRoutes from "./routes/Campaign.route";
import sendEmailroutes from "./routes/sendEmail.routes";
import Specificationroutes from "./routes/Specification.routes";
import Flyerroutes from "./routes/flyer.routes";
import DashBoardRoutes from "./routes/dashboard.route";
import BOOKINGROutes from "./routes/booking-rotues/booking.routes";
import UploadRoutes from "./routes/upload.route";
import JobReportRoutes from "./routes/booking-rotues/jobReport.routes";
import invoiceRouter from "./routes/booking-rotues/Invoice.route";

//payments
import PaypalRouter from "./routes/payments/Paypal.route";
import ZipPayroutes from "./routes/payments/ZipPay.route";
import AfterPayRoutes from "./routes/payments/afterpay.route";
const app = express();
const PORT = process.env.PORT;

app.set("trust proxy", 1);

// ✅ Middleware order matters!
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://89.116.134.75:3000",
      "https://cravebuy.com",
      "https://mailer.kayhanaudio.com.au",
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
app.use("/api/lead-follow-up/", LeadFolowUp);
app.use("/api/campaign/", campaignRoutes);
app.use("/api/send-email/", sendEmailroutes);
app.use("/api/product-specifications", Specificationroutes);
app.use("/api/flyer", Flyerroutes);
app.use("/api/dashboard", DashBoardRoutes);
app.use("/api/booking", BOOKINGROutes);
app.use("/api/upload", UploadRoutes);
app.use("/api/job-report", JobReportRoutes);
app.use("/api/invoices", invoiceRouter);

//payments
app.use("/api/paypal", PaypalRouter);
app.use("/api/zip-pay", ZipPayroutes);
app.use("/api/after-pay", AfterPayRoutes);

connectDb();

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT} 🚀`);
});
