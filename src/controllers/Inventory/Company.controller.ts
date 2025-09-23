import { Request, Response } from "express";
import Company from "../../models/Inventory/Company";
import Department from "../../models/Inventory/Department";
import { Op } from "sequelize";

// Get all companies
const getAllCompanies = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = (req.query.search as string) || "";

    const offset = (page - 1) * limit;

    const { count, rows } = await Company.findAndCountAll({
      where: search
        ? { name: { [Op.like]: `%${search}%` } } // ✅ Sequelize 6 syntax
        : undefined,
      offset,
      limit,
      include: [
        {
          model: Department,
          as: "Department",
          attributes: ["id", "name"], // only fetch what you need
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      data: rows,
      meta: {
        total: count,
        page,
        lastPage: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch companies" });
  }
};

// Get a single company by ID
const getCompanyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await Company.findByPk(id);
    if (!company) {
      res.status(404).json({ message: "Company not found" });
      return;
    }
    res.status(200).json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch company" });
  }
};

const createCompany = async (req: Request, res: Response) => {
  try {
    const { name, description, department_id, website } = req.body;
    console.log("api call");
    // --- Basic Validations ---
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      res
        .status(400)
        .json({
          message: "Name is required and must be at least 2 characters long",
        });
    }

    if (!department_id || isNaN(Number(department_id))) {
      res.status(400).json({ message: "Valid department_id is required" });
    }

    const existing = await Company.findOne({ where: { name: req.body.name } });
    if (existing) {
       res.status(400).json({ message: "Company name must be unique" });
       return
    }

    if (description && description.length > 500) {
      res
        .status(400)
        .json({ message: "Description cannot exceed 500 characters" });
    }

    // --- Create Company ---
    const newCompany = await Company.create({
      name: name.trim(),
      description,
      department_id: Number(department_id),
    });

    res.status(201).json(newCompany);
  } catch (error: any) {
    console.error(error);

    // Sequelize validation error (like unique constraint on name)
    if (error.name === "SequelizeUniqueConstraintError") {
      res.status(400).json({ message: "Company name must be unique" });
    }

    res.status(500).json({ message: "Failed to create company" });
  }
};

// Update a company by ID
const updateCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, department_id, website } = req.body;

    const company = await Company.findByPk(id);
    if (!company) {
      res.status(404).json({ message: "Company not found" });
      return;
    }

    await company.update({ name, description, department_id });
    res.status(200).json(company);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update company" });
  }
};

// Delete a company by ID
const deleteCompany = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const company = await Company.findByPk(id);
    if (!company) {
      res.status(404).json({ message: "Company not found" });
      return;
    }

    await company.destroy();
    res.status(200).json({ message: "Company deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete company" });
  }
};

export {
  createCompany,
  updateCompany,
  getAllCompanies,
  getCompanyById,
  deleteCompany,
};
