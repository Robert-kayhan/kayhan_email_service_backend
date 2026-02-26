import express from "express";
import {
  createManualType,
  getManualTypes,
  getManualTypeById,
  updateManualType,
  deleteManualType,
} from "../../controllers/Inventory/mannual.controller";

const router = express.Router();

router.post("/", createManualType);
router.get("/", getManualTypes);
router.get("/:id", getManualTypeById);
router.put("/:id", updateManualType);
router.delete("/:id", deleteManualType);

export default router;