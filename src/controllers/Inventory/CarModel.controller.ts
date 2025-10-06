import { Request, Response } from "express";
import CarModel from "../../models/Inventory/CarModel";
import axios from "axios";
import Company from "../../models/Inventory/Company";

// Make sure you add the self-association somewhere after CarModel.init

/**
 * Get all car models (optionally filter top-level or by category)
 */
const getAllCarModels = async (req: Request, res: Response) => {
  console.log("api call");
  try {
    // extract query params
    const {
      parent_id,
      company_id,
      page = "1",
      limit = "10",
      search = "",
    } = req.query;

    // pagination
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const offset = (pageNum - 1) * limitNum;

    // filters
    const where: any = {};
    if (parent_id !== undefined) where.parent_id = parent_id;
    if (company_id !== undefined) where.company_id = company_id;

    // search (by name, slug, title, etc.)
    if (search && (search as string).trim() !== "") {
      const { Op } = require("sequelize");
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } },
        { title: { [Op.like]: `%${search}%` } },
      ];
    }

    // query with pagination
    const { count, rows } = await CarModel.findAndCountAll({
      where,
      include: { model: CarModel, as: "children" },
      order: [["id", "ASC"]],
      limit: limitNum,
      offset,
    });

    res.json({
      data: rows,
      total: count,
      page: pageNum,
      totalPages: Math.ceil(count / limitNum),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get a single car model by ID with its children
 */
const getCarModelById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const carModel = await CarModel.findByPk(id, {
      include: { model: CarModel, as: "children" },
    });

    if (!carModel) {
      res.status(404).json({ message: "CarModel not found" });
      return;
    }

    res.json(carModel);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Create a new car model
 */
const createCarModel = async (req: Request, res: Response) => {
  try {
    const { parent_id, company_id, name, description, created_by, status } =
      req.body;

    // 🔹 1. Required fields check
    if (!company_id) {
      res.status(400).json({ message: "company_id is required" });
    }
    if (!name || typeof name !== "string") {
      res.status(400).json({ message: "Valid name is required" });
    }

    // 🔹 3. Optional: parent_id exists if provided
    if (parent_id) {
      const parent = await CarModel.findByPk(parent_id);
      if (!parent) {
        res.status(400).json({ message: "Invalid parent_id" });
      }
    }

    // 🔹 4. Insert record
    const carModel = await CarModel.create({
      parent_id: parent_id || null,
      company_id,
      name: name.trim(),
      description: description || null,
      created_by,
      status: status ?? 1,
    });

    res.status(201).json(carModel);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

const updateCarModel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { parent_id, company_id, name, description, created_by } = req.body;

    // Find the car model
    const carModel: any = await CarModel.findByPk(id);
    if (!carModel) {
      res.status(404).json({ message: "CarModel not found" });
    }

    // Validation
    const errors: Record<string, string> = {};
    if (!name || name.trim() === "") errors.name = "Name is required";
    if (!company_id) errors.company_id = "Company is required";

    if (Object.keys(errors).length > 0) {
      res.status(400).json({ errors });
      return;
    }

    // Update only allowed fields
    await carModel.update({
      parent_id: parent_id ?? carModel.parent_id,
      company_id: company_id ?? carModel.company_id,
      name: name ?? carModel.name,
      description: description ?? carModel.description,
      created_by: created_by ?? carModel.created_by,
    });

    res.json(carModel);
  } catch (error: any) {
    console.error("Failed to update CarModel:", error);
    res.status(500).json({ message: error.message });
  }
};

const deleteCarModel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const carModel = await CarModel.findByPk(id);
    if (!carModel) {
      res.status(404).json({ message: "CarModel not found" });
      return;
    }

    await carModel.destroy(); // soft delete because paranoid: true

    res.json({ message: "CarModel deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
const CAR_MODEL_API = "http://localhost:5003/v1/car_model/list?limit=1000";
const CATEGORY_API = "http://localhost:5003/v1/category/list"; // API for categories

export const syncCarModelsWithLocalCompanies = async () => {
  try {
    console.log("📦 Fetching categories from API...");

    const resCategories = await axios.get(CATEGORY_API);
    const apiCategories = resCategories.data?.data?.result || [];

    // Build API category ID -> local company ID map
    const apiCategoryIdToLocalCompanyId = new Map<number, number>();

    for (const category of apiCategories) {
      const [company] = await Company.findOrCreate({
        where: { name: category.name },
        defaults: {
          name: category.name,
          description: category.description || "",
          department_id: [],
        },
      });
      apiCategoryIdToLocalCompanyId.set(category.id, company.id);
    }

    console.log("📦 Fetching car models from API...");
    const resModels = await axios.get(CAR_MODEL_API);
    const carModels = resModels.data?.data?.result || [];
    console.log(`✅ Fetched ${carModels.length} car models`);

    const result: any[] = [];

    // 1️⃣ First pass: insert all models with parent_id = null
    for (const model of carModels) {
      const localCompanyId = apiCategoryIdToLocalCompanyId.get(
        model.category_id
      );
      if (!localCompanyId) continue;

      const [existing] = await CarModel.findOrCreate({
        where: { name: model.name, company_id: localCompanyId },
        defaults: {
          id: model.id,
          parent_id: null, // temporarily null
          company_id: localCompanyId,
          name: model.name,
          description: model.description || "",
          created_by: model.created_by || 1,
          edit_by: model.edit_by || null,
          status: model.status ?? 1,
          created_at: model.created_at
            ? new Date(model.created_at)
            : new Date(),
          updated_at: model.updated_at
            ? new Date(model.updated_at)
            : new Date(),
          deleted_at: model.deleted_at ? new Date(model.deleted_at) : null,
        },
      });

      result.push(existing);
    }

    // 2️⃣ Second pass: update parent_id now that all models exist
    for (const model of carModels) {
      if (!model.parent_id) continue;

      const localCompanyId = apiCategoryIdToLocalCompanyId.get(
        model.category_id
      );
      if (!localCompanyId) continue;

      const existing = await CarModel.findOne({
        where: { name: model.name, company_id: localCompanyId },
      });
      const parent = await CarModel.findOne({ where: { id: model.parent_id } });

      if (existing && parent) {
        await existing.update({ parent_id: parent.id });
      }
    }

    return {
      success: true,
      message: "Car models synced with local companies successfully",
      data: { result },
    };
  } catch (error: any) {
    console.error("❌ Car model sync failed:", error.message);
    return {
      success: false,
      message: "Car model sync failed",
      error: error.message,
    };
  }
};
export {
  createCarModel,
  getAllCarModels,
  getCarModelById,
  updateCarModel,
  deleteCarModel,
};
