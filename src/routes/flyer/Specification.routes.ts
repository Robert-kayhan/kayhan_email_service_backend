import { Router } from "express";
import {
  createProductSpecification,
  getAllProductSpecifications,
  getProductSpecificationById,
  updateProductSpecification,
  deleteProductSpecification,
} from "../../controllers/flyer/Specification.controller";

const router = Router();

router.post("/", createProductSpecification);
router.get("/", getAllProductSpecifications);
router.get("/:id", getProductSpecificationById);
router.put("/:id", updateProductSpecification);
router.delete("/:id", deleteProductSpecification);

export default router;
