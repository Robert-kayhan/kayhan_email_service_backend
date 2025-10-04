import { Request, Response } from "express";
import Product from "../../models/Inventory/Product";
import CarModel from "../../models/Inventory/CarModel";
import Company from "../../models/Inventory/Company";
import Channel from "../../models/Inventory/Channel";
import Department from "../../models/Inventory/Department";

// ✅ Create Product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, stock, car_model_id, company_id, channel_id, department_id } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      car_model_id,
      company_id,
      channel_id,
      department_id,
    });

    res.status(201).json({ success: true, data: product });
  } catch (error: any) {
    console.error("Create Product Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get All Products (with relations)
export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: CarModel, as: "CarModel" },
        { model: Company, as: "Company" },
        { model: Channel, as: "Channel" },
        { model: Department, as: "Department" },
      ],
    });

    res.json({ success: true, data: products });
  } catch (error: any) {
    console.error("Get Products Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get Product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: CarModel, as: "CarModel" },
        { model: Company, as: "Company" },
        { model: Channel, as: "Channel" },
        { model: Department, as: "Department" },
      ],
    });

    if (!product) {
       res.status(404).json({ success: false, message: "Product not found" });
       return
    }

    res.json({ success: true, data: product });
  } catch (error: any) {
    console.error("Get Product Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update Product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
       res.status(404).json({ success: false, message: "Product not found" });
       return
    }

    await product.update(req.body);

    res.json({ success: true, data: product });
  } catch (error: any) {
    console.error("Update Product Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete Product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const deleted = await Product.destroy({
      where: { id: req.params.id },
    });

    if (!deleted) {
       res.status(404).json({ success: false, message: "Product not found" });
       return
    }

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
