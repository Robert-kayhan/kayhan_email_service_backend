import { Request, Response } from "express";
import Template from "../models/Template";

// 🔹 Create a new template
const createTemplate = async (req: Request, res: Response) => {
  try {
    const { name, design, html } = req.body;

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
    const template = await Template.create({ name, design, html });

     res.status(201).json({
      message: "Template created successfully",
      data: template,
    });
  } catch (error) {
    console.error("Error creating template:", error);
     res.status(500).json({ message: "Internal server error" });
  }
};

// 🔹 Get all templates
const getAllTemplates = async (req: Request, res: Response) => {
  try {
    // 👇 Get page and limit from query, with defaults
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: templates } = await Template.findAndCountAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]], // optional: latest first
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
    const { name, design, html } = req.body;

    const template = await Template.findByPk(id);
    if (!template) {
      res.status(404).json({ message: "Template not found" });
      return;
    }

    await template.update({ name, design, html });

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
