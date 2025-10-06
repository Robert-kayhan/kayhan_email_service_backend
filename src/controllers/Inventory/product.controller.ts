import { Request, Response } from "express";
import Product from "../../models/Inventory/Product";
import CarModel from "../../models/Inventory/CarModel";
import Company from "../../models/Inventory/Company";
import Channel from "../../models/Inventory/Channel";
import Department from "../../models/Inventory/Department";
import axios from "axios";

// ✅ Create Product
const createProduct = async (req: Request, res: Response) => {
  console.log("hello");
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
      department_id,
    });

    res.status(201).json({ success: true, data: product });
  } catch (error: any) {
    console.error("Create Product Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get All Products (with relations)
const getProducts = async (req: Request, res: Response) => {
  try {
    // Get page and limit from query params, default to page 1 and limit 10
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Fetch products with pagination
    const { rows: products, count: total } = await Product.findAndCountAll({
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
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    await product.update(req.body);

    res.json({ success: true, data: product });
  } catch (error: any) {
    console.error("Update Product Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete Product
const deleteProduct = async (req: Request, res: Response) => {
  try {
    const deleted = await Product.destroy({
      where: { id: req.params.id },
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

// controllers/productSyncController.ts

// Example platform API URLs
const CAR_AUDIO_API = process.env.CAR_AUDIO_API;
const KAYHAN_AUDIO_API = process.env.KAYHAN_AUDIO_API;

// Utility function to normalize product data from different platforms
const normalizeProduct = (product: any, platform: string) => {
  return {
    name: product.name || product.title || "Unnamed Product",
    description: product.description || "",
    price: parseFloat(product.price) || 0,
    stock: product.stock ?? 0,
    images: product.images || [],
    sku_number: product.sku || product.sku_number || null,
    factory_price: product.factory_price || 0,
    retail_price: product.retail_price || 0,
    wholesale_price: product.wholesale_price || 0,
    weight: product.weight || 0,
    height: product.height || 0,
    width: product.width || 0,
    
    channel_id: platform === "carAudio" ? 1 : 2, // Example: 1=CarAudio, 2=KayhanAudio
  };
};

// Main function to fetch & store
 const getProductFromCarAudioandKayhanAudio = async () => {
  try {
    console.log("Fetching products from CarAudio...");
    const [ kayhanAudioRes] = await Promise.all([
      // axios.get(CAR_AUDIO_API as string),
      axios.get(KAYHAN_AUDIO_API as string),
    ]);

    // const carAudioProducts = carAudioRes.data?.products || [];
    const kayhanAudioProducts = kayhanAudioRes.data?.data || [];

    // console.log(
    //   `Fetched ${carAudioProducts.length} from CarAudio, ${kayhanAudioProducts.length} from KayhanAudio`
    // );

    // Combine all products
    const allProducts = [
      // ...carAudioProducts.map((p:any) => normalizeProduct(p, "carAudio")),
      ...kayhanAudioProducts.map((p:any) => normalizeProduct(p, "kayhanAudio")),
    ];

    // Store/update in DB
    for (const productData of allProducts) {
      await Product.upsert(
        {
          ...productData,
        },
        {
          conflictFields: ["sku_number"], // update existing if same SKU
        }
      );
    }

    console.log("✅ Product sync completed successfully.");
  } catch (error:any) {
    console.error("❌ Product sync failed:", error.message);
  }
};


export {
 createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductFromCarAudioandKayhanAudio
};
