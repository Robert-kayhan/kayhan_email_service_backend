import { Request, Response } from "express";
import Department from "../../models/Inventory/Department";
import axios from "axios";

// Create a new Department
const createDepartment = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      res.status(400).json({ message: "Name is required" });
      return;
    }

    const department = await Department.create({ name, description });
    res.status(201).json(department);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create department" });
  }
};

// Get all Departments with pagination and search
const getDepartments = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = (req.query.search as string) || "";

    const offset = (page - 1) * limit;

    const { count, rows } = await Department.findAndCountAll({
      where: search
        ? {
            name: { $like: `%${search}%` }, // Sequelize 6: use Op.like
          }
        : undefined,
      offset,
      limit,
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
    res.status(500).json({ message: "Failed to fetch departments" });
  }
};

// Get single Department by ID
const getDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const department = await Department.findByPk(id);

    if (!department) {
      res.status(404).json({ message: "Department not found" });
      return;
    }

    res.status(200).json(department);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch department" });
  }
};

// Update Department
const updateDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const department = await Department.findByPk(id);
    if (!department) {
      res.status(404).json({ message: "Department not found" });
      return;
    }

    await department.update({ name, description });
    res.status(200).json(department);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update department" });
  }
};

// Delete Department
const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const department = await Department.findByPk(id);

    if (!department) {
      res.status(404).json({ message: "Department not found" });
      return;
    }

    await department.destroy();
    res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete department" });
  }
};

const normalizeDepartment = (dept: any, platform: string) => {
  return {
    name: dept.name || "Unnamed Department",
    description: dept.description || "",
    // channel_id: platform === "carAudio" ? 1 : 2, // optional if you plan to link it
  };
};

const CAR_AUDIO_API = process.env.CAR_AUDIO_API;
const KAYHAN_AUDIO_API = process.env.KAYHAN_AUDIO_API;

// Main function to fetch & store
const getDepartmentFromCarAudioandKayhanAudio = async () => {
  try {
    console.log("📦 Fetching departments from Kayhan Audio...");

    const [kayhanAudioRes , carAudioRes ,carAudioResWithoutcarproduct] = await Promise.all([
      axios.get(`${KAYHAN_AUDIO_API}/v1/department/list`),
      axios.get(`${CAR_AUDIO_API}/v1/department/list`), 
      axios.get(`${CAR_AUDIO_API}/v1/department/list?is_car_product=false`), 
    ]);

    const kayhanDepartments = kayhanAudioRes.data?.data?.result || [];
    const carAudioDepartments = carAudioRes.data?.data?.result
    const carAudioDepartmentsWithoutCarProdct = carAudioResWithoutcarproduct.data?.data?.result
    console.log(
      `✅ Fetched ${kayhanDepartments.length} departments from Kayhan Audio`
    );

    const allDepartments = [
      ...kayhanDepartments.map((d: any) =>
        normalizeDepartment(d, "kayhanAudio")
      ),
      ...carAudioDepartments.map((d: any) =>
        normalizeDepartment(d, "kayhanAudio")
      ),
    ];
    console.log(allDepartments)
    for (const dept of allDepartments) {
      const [record, created] = await Department.findOrCreate({
        where: { name: dept.name },
        defaults: dept,
      });
      if (!created) {
        await record.update(dept);
      }
    }

    console.log("🎯 Department sync completed successfully.");
  } catch (error: any) {
    console.error("❌ Department sync failed:", error.message);
  }
};

export {
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartment,
  getDepartments,
  getDepartmentFromCarAudioandKayhanAudio,
};
