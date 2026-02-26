// src/controllers/inventory/versionController.ts
import { Request, Response } from "express";
import { Op } from "sequelize";
import Version from "../../models/Inventory/Virson"; // your model path

// ✅ CREATE
const createVersion = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description, status, created_by } = req.body;

        if (!name || !created_by) {
            res.status(400).json({ message: "name and created_by are required." });
            return;
        }

        // prevent duplicate name (because unique: true)
        const existing = await Version.findOne({ where: { name } });
        if (existing) {
            res.status(409).json({ message: "Version name already exists." });
            return;
        }

        const version = await Version.create({
            name: name.trim(),
            description: description ?? null,
            status: status ?? 1,
            created_by,
        });

        res.status(201).json({ message: "Version created successfully.", data: version });
    } catch (error: any) {
        res.status(500).json({
            message: "Failed to create version.",
            error: error?.message || error,
        });
    }
};

// ✅ LIST (search + pagination)
const getAllVersions = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 15;
        const offset = (page - 1) * limit;

        const search = (req.query.search as string) || "";
        const status = req.query.status ? Number(req.query.status) : undefined;

        const where: any = {};

        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
            ];
        }

        if (typeof status === "number" && !Number.isNaN(status)) {
            where.status = status;
        }

        const { rows, count } = await Version.findAndCountAll({
            where,
            limit,
            offset,
            order: [["created_at", "DESC"]],
        });

        res.status(200).json({
            message: "Versions fetched successfully.",
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
            },
        });
    } catch (error: any) {
        res.status(500).json({
            message: "Failed to fetch versions.",
            error: error?.message || error,
        });
    }
};

// ✅ GET ONE
const getVersionById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);
        if (!id) {
            res.status(400).json({ message: "Invalid id." });
            return;
        }

        const version = await Version.findByPk(id);
        if (!version) {
            res.status(404).json({ message: "Version not found." });
            return;
        }

        res.status(200).json({ message: "Version fetched successfully.", data: version });
    } catch (error: any) {
        res.status(500).json({
            message: "Failed to fetch version.",
            error: error?.message || error,
        });
    }
};

// ✅ UPDATE
const updateVersion = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);
        const { name, description, status, edit_by } = req.body;

        if (!id) {
            res.status(400).json({ message: "Invalid id." });
            return;
        }

        const version = await Version.findByPk(id);
        if (!version) {
            res.status(404).json({ message: "Version not found." });
            return;
        }

        // if changing name, ensure unique
        if (name && name.trim() !== version.getDataValue("name")) {
            const exists = await Version.findOne({
                where: { name: name.trim(), id: { [Op.ne]: id } },
            });
            if (exists) {
                res.status(409).json({ message: "Version name already exists." });
                return;
            }
        }

        await version.update({
            name: name ? name.trim() : version.getDataValue("name"),
            description: description ?? version.getDataValue("description"),
            status: typeof status === "number" ? status : version.getDataValue("status"),
            edit_by: edit_by ?? version.getDataValue("edit_by"),
        });

        res.status(200).json({ message: "Version updated successfully.", data: version });
    } catch (error: any) {
        res.status(500).json({
            message: "Failed to update version.",
            error: error?.message || error,
        });
    }
};

// ✅ DELETE (soft delete if paranoid true)
const deleteVersion = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);
        if (!id) {
            res.status(400).json({ message: "Invalid id." });
            return;
        }

        const version = await Version.findByPk(id);
        if (!version) {
            res.status(404).json({ message: "Version not found." });
            return;
        }

        await version.destroy(); // soft delete if paranoid enabled
        res.status(200).json({ message: "Version deleted successfully." });
    } catch (error: any) {
        res.status(500).json({
            message: "Failed to delete version.",
            error: error?.message || error,
        });
    }
};

export {
    createVersion, updateVersion, deleteVersion, getAllVersions, getVersionById
}