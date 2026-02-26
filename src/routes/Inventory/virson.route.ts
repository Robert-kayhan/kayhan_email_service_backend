// src/routes/inventory/versionRoutes.ts
import { Router } from "express";
import {
  createVersion,
  getAllVersions,
  getVersionById,
  updateVersion,
  deleteVersion,
} from "../../controllers/Inventory/Virson.controller";

const router = Router();

// ✅ Create
router.post("/", createVersion);

// ✅ List (supports ?page=&limit=&search=&status=)
router.get("/", getAllVersions);

// ✅ Get one
router.get("/:id", getVersionById);

// ✅ Update
router.put("/:id", updateVersion);

// ✅ Delete (soft delete if paranoid: true)
router.delete("/:id", deleteVersion);

export default router;