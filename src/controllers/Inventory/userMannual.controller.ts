import { Request, Response } from "express";
import { col, fn, Op } from "sequelize";
import UserManual from "../../models/Inventory/UserManual";

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

// ✅ unique slug generator: title, title-2, title-3...
const generateUniqueSlug = async (base: string, excludeId?: number) => {
  const baseSlug = slugify(base);
  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const where: any = { slug };
    if (excludeId) where.id = { [Op.ne]: excludeId };

    const exists = await UserManual.findOne({ where });
    if (!exists) return slug;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

// ✅ CREATE
export const createUserManual = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      company_id,

      model_id,
      sub_model_id,

      from_year,
      to_year,
      version_id,

      manual_type_id, // ✅ NEW

      title,
      content,
      cover_image,
      status,
      created_by,

      slug, // optional
    } = req.body;

    // ✅ required
    if (!company_id || !model_id || !from_year || !to_year || !title || !content) {
      res.status(400).json({ message: "Required fields missing." });
      return;
    }

    if (Number(from_year) > Number(to_year)) {
      res.status(400).json({ message: "from_year cannot be greater than to_year." });
      return;
    }

    // ✅ auto unique slug
    const finalSlug = slug?.trim()
      ? await generateUniqueSlug(String(slug))
      : await generateUniqueSlug(String(title));

    const manual = await UserManual.create({
      company_id: Number(company_id),

      model_id: Number(model_id),
      sub_model_id: sub_model_id ? Number(sub_model_id) : null,

      from_year: Number(from_year),
      to_year: Number(to_year),

      version_id: version_id ? Number(version_id) : null,

      // ✅ NEW
      manual_type_id: manual_type_id ? Number(manual_type_id) : null,

      title: String(title).trim(),
      slug: finalSlug,
      content: String(content),

      cover_image: cover_image || null,

      status: status ?? 1,
      created_by: Number(created_by || 1),
    });

    res.status(201).json({
      message: "User manual created successfully.",
      data: manual,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to create user manual.",
      error: error?.message || error,
    });
  }
};

// ✅ LIST
export const getAllUserManuals = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 15;
    const offset = (page - 1) * limit;

    const {
      company_id,
      model_id,
      sub_model_id,

      from_year,
      to_year,
      version_id,

      manual_type_id, // ✅ NEW

      search,
      status,
    } = req.query;

    const where: any = {};

    if (company_id) where.company_id = Number(company_id);
    if (model_id) where.model_id = Number(model_id);
    if (sub_model_id) where.sub_model_id = Number(sub_model_id);

    if (version_id) where.version_id = Number(version_id);

    // ✅ NEW
    if (manual_type_id) where.manual_type_id = Number(manual_type_id);

    if (status !== undefined) where.status = Number(status);

    // ✅ year overlap:
    if (from_year) where.to_year = { [Op.gte]: Number(from_year) };
    if (to_year) where.from_year = { [Op.lte]: Number(to_year) };

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } },
      ];
    }

    const { rows, count } = await UserManual.findAndCountAll({
      where,
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      message: "User manuals fetched successfully.",
      data: rows,
      meta: {
        total: count,
        page,
        lastPage: Math.ceil(count / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch manuals.",
      error: error?.message || error,
    });
  }
};

// ✅ GET BY SLUG
export const getUserManualBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;

    const manual = await UserManual.findOne({ where: { slug } });
    if (!manual) {
      res.status(404).json({ message: "Manual not found." });
      return;
    }

    res.status(200).json({
      message: "Manual fetched successfully.",
      data: manual,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to fetch manual.",
      error: error?.message || error,
    });
  }
};

// ✅ UPDATE
export const updateUserManual = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    const manual = await UserManual.findByPk(id);
    if (!manual) {
      res.status(404).json({ message: "Manual not found." });
      return;
    }

    const {
      title,
      content,
      cover_image,
      status,
      edit_by,

      company_id,
      model_id,
      sub_model_id,

      from_year,
      to_year,
      version_id,

      manual_type_id, // ✅ NEW

      slug, // optional
    } = req.body;

    const nextFrom = from_year ?? manual.getDataValue("from_year");
    const nextTo = to_year ?? manual.getDataValue("to_year");
    if (Number(nextFrom) > Number(nextTo)) {
      res.status(400).json({ message: "from_year cannot be greater than to_year." });
      return;
    }

    // ✅ slug rule:
    // - if slug provided => make it unique
    // - else if title changed => regenerate unique slug from title
    // - else keep existing
    let finalSlug: string = manual.getDataValue("slug");

    if (slug?.trim()) {
      finalSlug = await generateUniqueSlug(String(slug), id);
    } else if (title && String(title).trim() !== manual.getDataValue("title")) {
      finalSlug = await generateUniqueSlug(String(title), id);
    }

    await manual.update({
      title: title !== undefined ? String(title).trim() : manual.getDataValue("title"),
      slug: finalSlug,

      content: content !== undefined ? String(content) : manual.getDataValue("content"),

      cover_image:
        cover_image !== undefined ? cover_image : manual.getDataValue("cover_image"),

      status: status ?? manual.getDataValue("status"),
      edit_by: edit_by ?? manual.getDataValue("edit_by"),

      company_id: company_id ?? manual.getDataValue("company_id"),

      model_id: model_id ?? manual.getDataValue("model_id"),
      sub_model_id:
        sub_model_id !== undefined
          ? sub_model_id
            ? Number(sub_model_id)
            : null
          : manual.getDataValue("sub_model_id"),

      from_year: from_year ?? manual.getDataValue("from_year"),
      to_year: to_year ?? manual.getDataValue("to_year"),

      version_id:
        version_id !== undefined
          ? version_id
            ? Number(version_id)
            : null
          : manual.getDataValue("version_id"),

      // ✅ NEW
      manual_type_id:
        manual_type_id !== undefined
          ? manual_type_id
            ? Number(manual_type_id)
            : null
          : manual.getDataValue("manual_type_id"),
    });

    res.status(200).json({
      message: "User manual updated successfully.",
      data: manual,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to update manual.",
      error: error?.message || error,
    });
  }
};

// ✅ DELETE
export const deleteUserManual = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    const manual = await UserManual.findByPk(id);
    if (!manual) {
      res.status(404).json({ message: "Manual not found." });
      return;
    }

    await manual.destroy();
    res.status(200).json({ message: "User manual deleted successfully." });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to delete manual.",
      error: error?.message || error,
    });
  }
};


export const getYearByMannul = async (req: Request, res: Response): Promise<void> => {
  console.log("this is api")
  try {
    const company_id = req.query.company_id ? Number(req.query.company_id) : undefined;
    const model_id = req.query.model_id ? Number(req.query.model_id) : undefined;
    const sub_model_id = req.query.sub_model_id ? Number(req.query.sub_model_id) : undefined;
    const manual_type_id = req.query.manual_type_id ? Number(req.query.manual_type_id) : undefined;
    const version_id = req.query.version_id ? Number(req.query.version_id) : undefined;

    if (!model_id || Number.isNaN(model_id)) {
      res.status(400).json({ message: "model_id is required" });
      return;
    }

    const where: any = {
      status: 1,
      model_id,
    };

    // optional filters
    if (company_id && !Number.isNaN(company_id)) where.company_id = company_id;
    if (manual_type_id && !Number.isNaN(manual_type_id)) where.manual_type_id = manual_type_id;
    if (version_id && !Number.isNaN(version_id)) where.version_id = version_id;

    // if sub_model_id is passed => filter by it
    // else => return years for all manuals under this model (including null sub_model_id ones)
    if (sub_model_id && !Number.isNaN(sub_model_id)) {
      where.sub_model_id = sub_model_id;
    }

    // get min(from_year) and max(to_year)
    const row:any = await UserManual.findOne({
      where,
      attributes: [
        [fn("MIN", col("from_year")), "minFromYear"],
        [fn("MAX", col("to_year")), "maxToYear"],
      ],
      raw: true,
    });

    const minFromYear = row?.minFromYear ? Number(row.minFromYear) : null;
    const maxToYear = row?.maxToYear ? Number(row.maxToYear) : null;

    if (!minFromYear || !maxToYear || Number.isNaN(minFromYear) || Number.isNaN(maxToYear)) {
      res.json({
        minYear: null,
        maxYear: null,
        years: [],
        message: "No manuals found for given filters",
      });
      return;
    }

    // clamp just in case bad data comes
    const minYear = Math.max(1950, minFromYear);
    const maxYear = Math.min(2100, maxToYear);

    const years: number[] = [];
    for (let y = minYear; y <= maxYear; y++) years.push(y);

    res.json({
      minYear,
      maxYear,
      years,
    });
  } catch (error: any) {
    console.error("getYearByMannul error:", error);
    res.status(500).json({ message: "Server error" });
  }
};