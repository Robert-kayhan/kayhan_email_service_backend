// src/routes/inventory/userManualRoutes.ts
import { Router } from "express";
import {
  createUserManual,
  getAllUserManuals,
  getUserManualBySlug,
  updateUserManual,
  deleteUserManual,
  getYearByMannul,
} from "../../controllers/Inventory/userMannual.controller";

const router = Router();

// ✅ Create manual
router.post("/", createUserManual);

// ✅ List manuals (filters: ?company_id=&car_model_id=&year=&version_id=&status=&search=&page=&limit=)
router.get("/", getAllUserManuals);

// ✅ Detail page by slug (blog style)
router.get("/slug/:slug", getUserManualBySlug);

// ✅ Update manual
router.put("/:id", updateUserManual);

// ✅ Delete manual (soft delete if paranoid: true)
router.delete("/:id", deleteUserManual);
router.get("/years", getYearByMannul);

export default router;