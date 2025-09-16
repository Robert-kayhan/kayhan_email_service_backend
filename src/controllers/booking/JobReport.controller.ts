// controllers/JobReportController.ts
import { Request, Response } from "express";
import JobReport from "../../models/bookingSystem/JobReport";
import Booking from "../../models/bookingSystem/Booking";
import { where } from "sequelize";
// 🔹 Create / Save Job Report
const createJobReport = async (req: Request, res: Response): Promise<void> => {
  console.log("job api call");
  try {
    const {
      bookingId,
      techId,
      techName,
      beforePhotos,
      afterPhotos,
      notes,
      tips,
      difficulty,
      customerRating,
      arrivalTime,
      startTime,
      completionTime,
      totalDurationMins,
    } = req.body;
    console.log(req.body, "this is body");
    const existingReport = await JobReport.findOne({ where: { bookingId } });
    if (existingReport) {
       res.status(400).json({
        success: false,
        message: "A job report already exists for this booking",
      });
    }
    const report = await JobReport.create({
      bookingId,
      techId,
      techName,
      beforePhotos,
      afterPhotos,
      notes,
      tips,
      difficulty,
      customerRating,
      arrivalTime,
      startTime,
      completionTime,
      totalDurationMins,
      status: "Completed",
    });
    
    res.status(201).json({ success: true, report });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create job report" });
  }
};

// 🔹 Get Job Report by ID
const getJobReportById = async (req: Request, res: Response) => {
  console.log("apicall")
  try {
    const { id } = req.params;
    const report = await JobReport.findOne({
      where : {
        bookingId : id
      }
    });
    if (!report) {
       res
        .status(404)
        .json({ success: false, message: "Job report not found" });
    }
    res.json({ success: true, report });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch job report" });
  }
};

// 🔹 Update Job Report

// 🔹 Cancel Job
const cancelJob = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { cancelReason } = req.body;
  console.log("api calls", id, cancelReason);
  if (!cancelReason) {
    res
      .status(400)
      .json({ success: false, message: "Cancel reason is required" });
    return;
  }
  console.log("this is second");
  try {
    const report = await JobReport.findOne({
      where: {
        bookingId: id,
      },
    });

    console.log(report, "this is repodr");
    await Booking.update({ status: "Cancelled" }, { where: { id } });

    if (report) {
      await report.update({
        status: "Cancelled",
        cancelReason: cancelReason,
      });
      res.json({ success: true, report });
    }
    console.log("this is third");

    res.status(404).json({ success: true, message: "Job report not found" });
  } catch (error) {
    console.error("Failed to cancel job:", error);
    res.status(500).json({ success: false, message: "Failed to cancel job" });
  }
};

// 🔹 Reschedule Job
const rescheduleJob = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rescheduleTime } = req.body;
  console.log("api call ", id, req.body);
  try {
    const report = await Booking.findByPk(id);
    if (!report) {
      res.status(404).json({ success: false, message: "Job report not found" });
      return;
    }
    await JobReport.update(
      {
        status: "Rescheduled",
        rescheduleTime, 
      },
      {
        where: { bookingId: id }, // field name must match your model
      }
    );
    await report.update(  { date: rescheduleTime,status : "Rescheduled" });
    res.json({ success: true, report });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to reschedule job" });
  }
};
export { createJobReport, rescheduleJob, cancelJob ,getJobReportById};
