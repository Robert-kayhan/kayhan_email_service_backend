import { Request, Response } from "express";
import Company from "../../models/Inventory/Company";
import Department from "../../models/Inventory/Department";
import { Op } from "sequelize";
import axios from "axios";

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
      res.status(400).json({
        message: "Name is required and must be at least 2 characters long",
      });
    }

    if (!department_id || isNaN(Number(department_id))) {
      res.status(400).json({ message: "Valid department_id is required" });
    }

    const existing = await Company.findOne({ where: { name: req.body.name } });
    if (existing) {
      res.status(400).json({ message: "Company name must be unique" });
      return;
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
  department_id: Array.isArray(department_id)
    ? department_id.map(Number) // ensure all are numbers
    : [Number(department_id)],  // if a single ID is provided
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


const KAYHAN_AUDIO_API = process.env.KAYHAN_AUDIO_API;

let apiDeptIdToNameMap: Map<number, string> = new Map(); // API dept ID -> name

// 1️⃣ Map API department names -> local department IDs
const getDepartmentNameMap = async (): Promise<Map<string, number>> => {
  const res = await axios.get(`${KAYHAN_AUDIO_API}/v1/department/list`);
  const apiDepartments = res.data?.data?.result || [];

  const localDepartments = await Department.findAll();

  const departmentMap = new Map<string, number>();

  // Build API ID -> Name map
  apiDepartments.forEach((apiDept: any) => {
    apiDeptIdToNameMap.set(apiDept.id, apiDept.name); // store ID -> name
    const matched = localDepartments.find(
      (localDept) => localDept.name.toLowerCase() === apiDept.name.toLowerCase()
    );
    if (matched) {
      departmentMap.set(apiDept.name, matched.id); // name -> local ID
    }
  });

  return departmentMap;
};

// 2️⃣ Replace API department_ids with local department IDs
const replaceApiDeptIdsWithLocalIds = (company: any, departmentMap: Map<string, number>) => {
  const localDeptIds: number[] = [];

  if (company.department_ids?.length) {
    company.department_ids.forEach((apiDeptId: number) => {
      const apiDeptName = apiDeptIdToNameMap.get(apiDeptId); // get name from API ID
      if (apiDeptName && departmentMap.has(apiDeptName)) {
        localDeptIds.push(departmentMap.get(apiDeptName)!); // push local ID
      }
    });
  }

  return {
    ...company,
    department_ids: localDeptIds, // replace API IDs with local IDs
  };
};

// 3️⃣ Sync companies
export const companyFromCarAudioandKayhanAudio = async () => {
  try {
    console.log("📦 Fetching companies from API...");

    const departmentMap = await getDepartmentNameMap();

    const res = await axios.get(`${KAYHAN_AUDIO_API}/v1/category/list`);
    const companies = res.data?.data?.result || [];
    console.log(`✅ Fetched ${companies.length} companies`);

    const result: any[] = [];

    for (const company of companies) {
      // Replace API department IDs with local IDs
      const normalized = replaceApiDeptIdsWithLocalIds(company, departmentMap);

      // Check if company already exists
      const existing = await Company.findOne({ where: { name: normalized.name } });

      if (existing) {
        // Update existing company
        await existing.update({
          description: normalized.description,
          department_id: normalized.department_ids,
        });
        result.push(existing);
      } else {
        // Create new company
        const newCompany = await Company.create({
          name: normalized.name,
          description: normalized.description,
          department_id: normalized.department_ids,
        });
        result.push(newCompany);
      }
    }

    return {
      success: true,
      message: "Records got successfully",
      data: { result },
    };
  } catch (error: any) {
    console.error("❌ Company sync failed:", error.message);
    return {
      success: false,
      message: "Company sync failed",
      error: error.message,
    };
  }
};

export {
  createCompany,
  updateCompany,
  getAllCompanies,
  getCompanyById,
  deleteCompany,
};
