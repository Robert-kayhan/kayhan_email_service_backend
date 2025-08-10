// routes/flyerRoutes.ts
import { Router } from "express";
import {
  createFlyer,
  getAllFlyers,
  getFlyerById,
  updateFlyer,
  deleteFlyer,
} from "../controllers/flyer.Controller";

const router = Router();

router.post("/", createFlyer);
router.get("/", getAllFlyers);
router.get("/:id", getFlyerById);
router.put("/:id", updateFlyer);
router.delete("/:id", deleteFlyer);

export default router;
