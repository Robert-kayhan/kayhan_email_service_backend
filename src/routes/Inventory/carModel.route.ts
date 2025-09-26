import { Router } from "express";
import {
  getAllCarModels,
  getCarModelById,
  createCarModel,
  updateCarModel,
  deleteCarModel,
} from "../../controllers/Inventory/CarModel.controller";

const router = Router();

router.get("/", getAllCarModels);
router.get("/:id", getCarModelById);
router.post("/", createCarModel);
router.put("/:id", updateCarModel);
router.delete("/:id", deleteCarModel);

export default router;
