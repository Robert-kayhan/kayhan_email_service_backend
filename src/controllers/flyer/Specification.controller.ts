import { Request, Response } from "express";
import ProductSpecification from "../../models/flyer/Specification";

const validateSpecifications = (specifications: any) => {
  if (!Array.isArray(specifications)) {
    return "Specifications must be an array";
  }

  for (const item of specifications) {
    if (
      typeof item !== "object" ||
      typeof item.title !== "string" ||
      typeof item.description !== "string"
    ) {
      return "Each specification must have title and description";
    }
  }

  return null;
};


const createProductSpecification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, specifications } = req.body;

    if (specifications) {
      const validationError = validateSpecifications(specifications);

      if (validationError) {
        res.status(400).json({
          success: false,
          message: validationError,
        });
        return;
      }
    }

    const spec = await ProductSpecification.create({
      name,
      specifications,
    });

    res.status(201).json({
      success: true,
      message: "Product specification created successfully",
      data: spec,
    });
  } catch (error: any) {
    console.error("Error creating product specification:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to create product specification",
    });
  }
};
const getAllProductSpecifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const specs = await ProductSpecification.findAll({
      order: [["id", "DESC"]],
    });

    res.json({
      success: true,
      data: specs,
    });
  } catch (error: any) {
    console.error("Error fetching product specifications:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch product specifications",
    });
  }
};
const getProductSpecificationById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const spec = await ProductSpecification.findByPk(req.params.id);

    if (!spec) {
      res.status(404).json({
        success: false,
        message: "Product specification not found",
      });
      return;
    }

    res.json({
      success: true,
      data: spec,
    });
  } catch (error: any) {
    console.error("Error fetching product specification:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch product specification",
    });
  }
};
const updateProductSpecification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, specifications } = req.body;

    const spec = await ProductSpecification.findByPk(req.params.id);

    if (!spec) {
      res.status(404).json({
        success: false,
        message: "Product specification not found",
      });
      return;
    }

    if (specifications) {
      const validationError = validateSpecifications(specifications);

      if (validationError) {
        res.status(400).json({
          success: false,
          message: validationError,
        });
        return;
      }
    }

    await spec.update({
      name,
      specifications,
    });

    res.json({
      success: true,
      message: "Product specification updated successfully",
      data: spec,
    });
  } catch (error: any) {
    console.error("Error updating product specification:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to update product specification",
    });
  }
};
const deleteProductSpecification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const spec = await ProductSpecification.findByPk(req.params.id);

    if (!spec) {
      res.status(404).json({
        success: false,
        message: "Product specification not found",
      });
      return;
    }

    await spec.destroy();

    res.json({
      success: true,
      message: "Product specification deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting product specification:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete product specification",
    });
  }
};

export {
  createProductSpecification,
  getAllProductSpecifications,
  getProductSpecificationById,
  updateProductSpecification,
  deleteProductSpecification
}