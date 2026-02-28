import { Request, Response } from "express";
import ManualType from "../../models/Inventory/ManualType";
import { Op } from "sequelize";

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const generateUniqueSlug = async (base: string): Promise<string> => {
  const baseSlug = slugify(base);
  let slug = baseSlug;
  let counter = 2;

  // find any that matches base OR base-<number>
  while (true) {
    const exists = await ManualType.findOne({ where: { slug } });
    if (!exists) return slug;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

/**
 * ✅ Create Manual Type (Auto slug)
 */
export const createManualType = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, slug, status } = req.body;

    if (!name) {
      res.status(400).json({ message: "Name is required" });
      return;
    }

    // ✅ if slug not provided, create automatically from name
    const finalSlug = slug?.trim()
      ? await generateUniqueSlug(slug)
      : await generateUniqueSlug(name);

    const manualType = await ManualType.create({
      name: name.trim(),
      slug: finalSlug,
      status: status ?? 1,
    });

    res.status(201).json({
      message: "Manual type created successfully",
      data: manualType,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ Get All Manual Types
 */
export const getManualTypes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    const { search } = req.query;

    const where: any = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } },
      ];
    }

    const { rows, count } = await ManualType.findAndCountAll({
      where,
      limit,
      offset,
      order: [["id", "DESC"]],
    });

    res.status(200).json({
      total: count,
      page,
      limit,
      data: rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ Get Manual Type By Id
 */
export const getManualTypeById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const manualType = await ManualType.findByPk(id);

    if (!manualType) {
      res.status(404).json({ message: "Manual type not found" });
      return;
    }

    res.status(200).json(manualType);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ Update Manual Type (Auto slug if missing)
 */
export const updateManualType = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, slug, status } = req.body;

    const manualType = await ManualType.findByPk(id);

    if (!manualType) {
      res.status(404).json({ message: "Manual type not found" });
      return;
    }

    // if name is changing and slug not provided => regenerate slug from name
    let finalSlug: string | undefined;

    if (slug?.trim()) {
      finalSlug = await generateUniqueSlug(slug);
    } else if (name?.trim() && name.trim() !== manualType.name) {
      finalSlug = await generateUniqueSlug(name);
    }

    // prevent update to a slug that belongs to another record
    if (finalSlug) {
      const exists = await ManualType.findOne({
        where: {
          slug: finalSlug,
          id: { [Op.ne]: id },
        },
      });
      if (exists) {
        res.status(409).json({ message: "Slug already exists" });
        return;
      }
    }

    await manualType.update({
      name: name?.trim() ?? manualType.name,
      slug: finalSlug ?? manualType.slug,
      status: status ?? manualType.status,
    });

    res.status(200).json({
      message: "Manual type updated successfully",
      data: manualType,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ Delete Manual Type
 */
export const deleteManualType = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const manualType = await ManualType.findByPk(id);

    if (!manualType) {
      res.status(404).json({ message: "Manual type not found" });
      return;
    }

    await manualType.destroy();

    res.status(200).json({
      message: "Manual type deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};