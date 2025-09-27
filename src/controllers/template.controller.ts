import { Request, Response } from "express";
import Template from "../models/Template";
import { Op } from "sequelize";

// 🔹 Create a new template
const createTemplate = async (req: Request, res: Response) => {
  try {
    const { name, design, html , type } = req.body;
    console.log(req.body , "this is req body")
    if (!name || !design || !html) {
       res.status(400).json({ message: "name, design, and html are required" });
       return
    }

    // ✅ Check if template with the same name exists
    const existingTemplate = await Template.findOne({ where: { name } });
    if (existingTemplate) {
       res.status(409).json({ message: "Template with this name already exists" });
       return
    }

    // ✅ Create new template
    const template = await Template.create({ name, design, html , type });

     res.status(201).json({
      message: "Template created successfully",
      data: template,
    });
  } catch (error) {
    console.error("Error creating template:", error);
     res.status(500).json({ message: "Internal server error" });
  }
};


const getAllTemplates = async (req: Request, res: Response) => {
  try {
    // 👇 Get page and limit from query, with defaults
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // 👇 Search query param
    const search = (req.query.search as string) || "";

    // 👇 Type filter query param
    const type = (req.query.type as string) || ""; // e.g., "Retail" or "wholeSale"

    // 👇 Build where condition
    const whereCondition: any = {};

    if (search) {
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    if (type) {
      whereCondition.type = type; // exact match for type
    }

    // 👇 Fetch with search + pagination
    const { count, rows: templates } = await Template.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      data: templates,
      meta: {
        totalItems: count,
        currentPage: page,
        totalPages,
        perPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};




// 🔹 Get template by ID
const getTemplateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const template = await Template.findByPk(id);

    if (!template) {
      res.status(404).json({ message: "Template not found" });
    }

    res.status(200).json(template);
  } catch (error) {
    console.error("Error fetching template:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 🔹 Update a template
const updateTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, design, html ,type } = req.body;

    const template = await Template.findByPk(id);
    if (!template) {
      res.status(404).json({ message: "Template not found" });
      return;
    }

    await template.update({ name, design, html ,type });

    res.status(200).json({
      message: "Template updated successfully",
      data: template,
    });
  } catch (error) {
    console.error("Error updating template:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 🔹 Delete a template
const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const template = await Template.findByPk(id);

    if (!template) {
      res.status(404).json({ message: "Template not found" });
      return;
    }

    await template.destroy();

    res.status(200).json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Error deleting template:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  createTemplate,
  getAllTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
};
