import { Request, Response } from "express";
import TechSupport from "../../models/Repair-Portal/tech-report-request";
import User from "../../models/user/User.model";
import { Op } from "sequelize";

const createReport = async (req: Request, res: Response) => {
  try {
    const {
      firstname,
      lastname,
      email,
      phone,

      companyName,
      modelName,
      year,
      productName,
      reason,
      orderNo,
    } = req.body;

    // Validate required fields
    if (
      !firstname ||
      !lastname ||
      !email ||
      !companyName ||
      !modelName ||
      !year ||
      !reason
    ) {
      res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Find or create user
    let user = await User.findOne({ where: { email } });

    if (!user) {
      user = await User.create({
        firstname,
        lastname,
        email,
        phone,
      });
    }

    // Create tech support report
    const newReport = await TechSupport.create({
      userId: user.id, // IMPORTANT
      companyName,
      modelName,
      year,
      productName,
      reason,
      status: "pending",
      orderNo: orderNo || "N/A",
    });

    res.status(201).json({
      success: true,
      message: "Tech support report created successfully",
      data: newReport,
    });
  } catch (error: any) {
    console.error("Error creating tech support report:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getAllTechRepair = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = "", status = "all" } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const reportWhere: any = {};
    const userWhere: any = {};

    // -------------------------------------
    // 🔍 STATUS FILTER (pending | complete | all)
    // -------------------------------------
    if (status !== "all") {
      reportWhere.status = status;
    }

    // -------------------------------------
    // 🔍 UNIVERSAL SEARCH
    // -------------------------------------
    if (search) {
      userWhere[Op.or] = [
        { firstname: { [Op.like]: `%${search}%` } },
        { lastname: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];

      reportWhere[Op.or] = [
        { trackingNumber: { [Op.like]: `%${search}%` } },
        { productName: { [Op.like]: `%${search}%` } },
        { companyName: { [Op.like]: `%${search}%` } },
        { modelName: { [Op.like]: `%${search}%` } },
      ];
    }

    const { rows, count } = await TechSupport.findAndCountAll({
      where: reportWhere,
      include: [
        {
          model: User,
          as: "user",
          where: Object.keys(userWhere).length ? userWhere : undefined,
          required: false,
        },
      ],
      limit: Number(limit),
      offset,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      message: "Tech repairs fetched successfully",
      total: count,
      currentPage: Number(page),
      totalPages: Math.ceil(count / Number(limit)),
      data: rows,
    });
  } catch (error: any) {
    console.error("Error fetching tech repairs:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
const findReportById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const report = await TechSupport.findByPk(id);

    if (!report) {
      res.status(404).json({ message: "Report not found" });
      return;
    }

    res.status(200).json({ data: report });
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
const updateReportById = async (req: Request, res: Response) => {
  const { id } = req.params; // Get report ID from URL
  const { postMethod, trackingNumber, status, notes } = req.body; // Fields to update

  try {
    // Find the report
    const report = await TechSupport.findByPk(id);
    if (!report) {
      res.status(404).json({ message: "Report not found" });
      return;
    }

    // Update fields
    if (postMethod !== undefined) report.postMethod = postMethod;
    if (trackingNumber !== undefined) report.trackingNumber = trackingNumber;
    if (status !== undefined) report.status = status;
    if (notes !== undefined) report.notes = notes;

    await report.save(); // Save changes

    res
      .status(200)
      .json({ message: "Report updated successfully", data: report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update report", error });
  }
};

const deletetechRepairById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deleteReport = await TechSupport.findByPk(id);
    if (!deleteReport) {
      res.status(400).json({
        message: "Report not found",
      });
    }
    deleteReport?.destroy();
    res.status(200).json({
      message: "Report Deleted Successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update report", error });
  }
};
export {
  createReport,
  getAllTechRepair,
  findReportById,
  updateReportById,
  deletetechRepairById,
};
