import { Request, Response } from "express";
import ProductSpecification from "../../models/flyer/Specification";

// Create a new product specification
export const createProductSpecification = async (req: Request, res: Response) => {
  try {
    const spec = await ProductSpecification.create(req.body);
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

// Get all product specifications
export const getAllProductSpecifications = async (req: Request, res: Response) => {
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

// Get a single product specification by ID
export const getProductSpecificationById = async (req: Request, res: Response) => {
  try {
    const spec = await ProductSpecification.findByPk(req.params.id);

    if (!spec) {
       res.status(404).json({
        success: false,
        message: "Product specification not found",
      });
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

// Update a product specification
export const updateProductSpecification = async (req: Request, res: Response) => {
  try {
    const spec = await ProductSpecification.findByPk(req.params.id);

    if (!spec) {
       res.status(404).json({
        success: false,
        message: "Product specification not found",
      });
      return
    }

    await spec.update(req.body);

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

// Delete a product specification
export const deleteProductSpecification = async (req: Request, res: Response) => {
  try {
    const spec = await ProductSpecification.findByPk(req.params.id);

    if (!spec) {
       res.status(404).json({
        success: false,
        message: "Product specification not found",
      });
      return
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
