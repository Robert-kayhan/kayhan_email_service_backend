import { Request, Response } from "express";
import Department from "../../models/Inventory/Department";

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

export {
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartment,
  getDepartments,
};
