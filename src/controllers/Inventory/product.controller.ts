import { Request, Response } from "express";
import Product from "../../models/Inventory/Product";
import CarModel from "../../models/Inventory/CarModel";
import Company from "../../models/Inventory/Company";
import Channel from "../../models/Inventory/Channel";
import Department from "../../models/Inventory/Department";
import axios from "axios";
import { Op, where } from "sequelize";

// ✅ Create Product
const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      images,
      sku_number,
      factory_price,
      retail_price,
      wholesale_price,
      weight,
      height,
      width,
      car_model_id,
      company_id,
      channel_id,
      department_id,
    } = req.body;

    // ----------------------------------------
    // Validate SKU Number
    // ----------------------------------------
    if (!sku_number) {
      res.status(400).json({
        success: false,
        message: "SKU number is required",
      });
      return;
    }

    // ----------------------------------------
    // Check if SKU already exists
    // ----------------------------------------
    const existingProduct = await Product.findOne({
      where: { sku_number },
    });

    if (existingProduct) {
      res.status(409).json({
        success: false,
        message: `Product with SKU '${sku_number}' already exists`,
      });
      return;
    }

    // ----------------------------------------
    // Create Product
    // ----------------------------------------
    const product = await Product.create({
      name,
      description,
      price,
      stock,
      images,
      sku_number,
      factory_price,
      retail_price,
      wholesale_price,
      weight,
      height,
      width,
      car_model_id,
      company_id,
      channel_id,
      // department_id,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error: any) {
    console.error("Create Product Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Get All Products (with relations)
const getProducts = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const search = req.query.search;

    // Dynamic WHERE conditions
    const whereCondition: any = {};

    if (search) {
      whereCondition[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { sku_number: { [Op.like]: `%${search}%` } },
      ];
    }

    const { rows: products, count: total } = await Product.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
      include: [
        { model: CarModel, as: "CarModel" },
        { model: Company, as: "Company" },
        { model: Channel, as: "Channel" },
        { model: Department, as: "Department" },
      ],
      order: [["id", "DESC"]],
    });
    const findALl = await Product.findAll()
    // console.log(findALl , "this is test")
    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error: any) {
    console.error("Get Products Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get Product by ID
const getProductById = async (req: Request, res: Response) => {
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
      return;
    }

    res.json({ success: true, data: product });
  } catch (error: any) {
    console.error("Get Product Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update Product
const updateProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      sku_number,
      factory_price,
      retail_price,
      wholesale_price,
      stock,
      weight,
      height,
      width,
      images,
      car_model_id,
      company_id,
      channel_id,
      department_id,
    } = req.body;
    const product = await Product.findByPk(req.params.id);
    console.log(req.body)
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }
    const updateData: any = {
      name,
      description,
      sku_number,
      factory_price: Number(factory_price) || 0,
      retail_price: Number(retail_price) || 0,
      wholesale_price: Number(wholesale_price) || 0,
      stock: Number(stock),
      weight: Number(weight) || 0,
      height: Number(height) || 0,
      width: Number(width) || 0,
      car_model_id: car_model_id ? Number(car_model_id) : null,
      company_id: company_id ? Number(company_id) : null,
      channel_id: channel_id ? Number(channel_id) : null,
      department_id: department_id ? Number(department_id) : null,
    };
    await product.update(updateData);

    res.json({ success: true, data: product });
  } catch (error: any) {
    console.error("Update Product Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete Product
const deleteProduct = async (req: Request, res: Response) => {
  try {
    console.log(req.params)
    const deleted = await Product.destroy({
      where: { sku_number: req.params.id },
    });

    if (!deleted) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const CAR_AUDIO_API = process.env.CAR_AUDIO_API;
const KAYHAN_AUDIO_API = process.env.KAYHAN_AUDIO_API;


const normalizeProduct = async (product: any, platform: string) => {
  // Find Department
  const department = await Department.findOne({
    where: { name: product.department_name },
  });

  // Find Company
  const company = await Company.findOne({
    where: { name: product.category_name },
  });

  // Validate car_model_id
  let carModelId: number | null = null;
  if (product.car_model_id && !isNaN(Number(product.car_model_id))) {
    const existingModel = await CarModel.findByPk(Number(product.car_model_id));
    if (existingModel) {
      carModelId = existingModel.id;
    } else {
      console.warn(
        `⚠️ Skipping invalid car_model_id: ${product.car_model_id} for product ${product.sku_number}`
      );
    }
  }

  return {
    sku_number: product.sku || product.sku_number || null,
    name: product.name || product.title || "Unnamed Product",
    description: product.description || "",
    retail_price: parseFloat(product.retail_price) || 0,
    factory_price: parseFloat(product.factory_price) || 0,
    wholesale_price: parseFloat(product.wholesale_price) || 0,
    // stock: 3   ,
    weight: product.weight || 0,
    height: product.height || 0,
    width: product.width || 0,
    images: Array.isArray(product.images)
      ? product.images.map((img: any) => img.image)
      : [],
    department_id: department ? department.id : null,
    company_id: company ? company.id : null,
    car_model_id: carModelId, // ✅ now guaranteed to be valid or null
    channel_id: 2, 
  };
};
// Main sync function
const getProductFromCarAudioandKayhanAudio = async () => {
  try {
    console.log("📦 Fetching products from APIs...");

    // Fetch KayhanAudio (and optionally CarAudio)
    const kayhanAudioRes = await axios.get(`${KAYHAN_AUDIO_API}/v1/product/fast-list`);
    const kayhanAudioProducts = kayhanAudioRes.data?.data || [];

    // Log how many fetched
    console.log(`✅ Fetched ${kayhanAudioProducts.length} products from KayhanAudio`);

    // Normalize all products
    const normalizedProducts = await Promise.all(
      kayhanAudioProducts.map((p: any) => normalizeProduct(p, "kayhanAudio"))
    );

    console.log("🧩 Saving products into database...");

    // Bulk upsert (faster than one-by-one)
    for (const productData of normalizedProducts) {
      await Product.upsert(productData, {
        conflictFields: ["sku_number"],
      });
    }

    console.log("🎉 Product sync completed successfully.");
  } catch (error: any) {
    console.error("❌ Product sync failed:", error.message);
  }
};
const updateProductBySku = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      sku_number,
      factory_price,
      retail_price,
      wholesale_price,
      stock,
      weight,
      height,
      width,
      images,
      car_model_id,
      company_id,
      channel_id,
      department_id,
    } = req.body;
    const { sku } = req.params;
    const product = await Product.findOne({
      where: {
        sku_number: sku
      }
    });
    console.log(req.body)
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }
    const updateData: any = {
      name,
      description,
      sku_number,
      factory_price: Number(factory_price) || 0,
      retail_price: Number(retail_price) || 0,
      wholesale_price: Number(wholesale_price) || 0,
      stock: Number(stock),
      weight: Number(weight) || 0,
      height: Number(height) || 0,
      width: Number(width) || 0,
      car_model_id: car_model_id ? Number(car_model_id) : null,
      company_id: company_id ? Number(company_id) : null,
      // channel_id: channel_id ? Number(channel_id) : null,
      // department_id: department_id ? Number(department_id) : null,
    };
    await product.update(updateData);

    res.json({ success: true, data: product });
  } catch (error: any) {
    console.error("Update Product Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductFromCarAudioandKayhanAudio,
  updateProductBySku
};
