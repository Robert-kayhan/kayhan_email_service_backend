import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateProductBySku
} from "../../controllers/Inventory/product.controller";

const router = Router();

router.post("/", createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.put("/:sku", updateProductBySku);
router.delete("/:id", deleteProduct);

export default router;
