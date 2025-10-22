// controllers/JobReportController.ts
import { Request, Response } from "express";
import JobReport from "../../models/bookingSystem/JobReport";
import Booking from "../../models/bookingSystem/Booking";

// 🔹 Create / Save Job Report
const createJobReport = async (req: Request, res: Response): Promise<void> => {
  console.log("job api call");
  try {
    const {
      bookingId,
      // techId,
      techName,
      beforePhotos,
      // afterPhotos,
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
      return
    }
    const report = await JobReport.create({
      bookingId,
      techName,
      beforePhotos,
      status : "In Progress",
      arrivalTime: arrivalTime
    });
    // console.log(report, "this is working budy");
    res.status(201).json({ success: true, message: "Job start successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create job report" });
  }
};

// 🔹 Get Job Report by ID
const getJobReportById = async (req: Request, res: Response) => {
  console.log("apicall");
  try {
    const { id } = req.params;
    const report = await JobReport.findOne({
      where: {
        bookingId: id,
      },
    });
    if (!report) {
      res.status(404).json({ success: false, message: "Job report not found" });
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
     const report = await JobReport.findOne({
      where: {
        bookingId: id,
      },
    });
  try {
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
    await report.update({ date: rescheduleTime, status: "Rescheduled" });
    res.json({ success: true, report });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to reschedule job" });
  }
};

const updateJobReport = async (req: Request, res: Response) => {
  console.log(req.body , req.params)
  try {
    const { id } = req.params;
    const {
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
      status,
      cancelReason,
      rescheduleTime,
    } = req.body;
    console.log(status)
    // Find the existing report
    const jobReport = await JobReport.findOne({
      where : {
        bookingId : id
      }
    });
    if (!jobReport) {
      res.status(404).json({ message: "Job report not found" });
      return 
    }
    console.log(afterPhotos)
    // Update fields if provided
    // if (techId !== undefined) jobReport.techId = techId;
    if (techName !== undefined) jobReport.techName = techName;
    if (beforePhotos !== undefined) jobReport.beforePhotos = beforePhotos;
    if (afterPhotos !== undefined) jobReport.afterPhotos = afterPhotos;
    if (notes !== undefined) jobReport.notes = notes;
    if (tips !== undefined) jobReport.tips = tips;
    if (difficulty !== undefined) jobReport.difficulty = difficulty;
    if (customerRating !== undefined) jobReport.customerRating = customerRating;
    if (arrivalTime !== undefined) jobReport.arrivalTime = arrivalTime;
    // if (startTime !== undefined) jobReport.startTime = startTime;
    // if (completionTime !== undefined) jobReport.completionTime = completionTime;
    // if (totalDurationMins !== undefined)
      jobReport.totalDurationMins = totalDurationMins;
    if (status !== undefined) jobReport.status = status;
    if (cancelReason !== undefined) jobReport.cancelReason = cancelReason;
    if (rescheduleTime !== undefined) jobReport.rescheduleTime = rescheduleTime;

    await jobReport.save();
   await Booking.update(
  { status: status }, // values to update
  { where: { id: id } } // condition
);

     res
      .status(200)
      .json({ message: "Job report updated successfully", jobReport });
  } catch (error: any) {
    console.error("Error updating job report:", error);
     res.status(500).json({
      message: "Failed to update job report",
      error: error.message || error,
    });
  }
};
const timeApi = async (req: Request, res: Response) => {
  console.log("time api call")
  try {
    const jobId = req.params.id;
    const { startTime, completionTime } = req.body;

    const job = await JobReport.findOne({
      where : {
        bookingId : jobId
      }
    });
    if (!job) {
       res.status(404).json({ message: "Job not found" });
       return
    }

    // Update times if provided
    if (startTime) job.startTime = new Date(startTime);
    if (completionTime) {
      job.completionTime = new Date(completionTime);

      // Calculate total duration in minutes
      if (job.startTime) {
        const durationMins = Math.round(
          (job.completionTime.getTime() - job.startTime.getTime()) / 60000
        );
        job.totalDurationMins = durationMins;
      }

      // Update status automatically if completed
      job.status = "Completed";
    }

    await job.save();

    res.json({ success: true, job });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};
export {
  createJobReport,
  rescheduleJob,
  cancelJob,
  getJobReportById,
  updateJobReport,
  timeApi
};
