// routes/flyerRoutes.ts
import { Router } from "express";
import {
  createsFlyer,
  getAllFlyers,
  getFlyerById,
  updateFlyer,
  deleteFlyer,
  createSingleProdctFlyer,
  sendFlyer
} from "../controllers/flyer.Controller";

const router = Router();

router.get("/", getAllFlyers);
router.post("/", createsFlyer);
router.get("/:id", getFlyerById);
router.put("/:id", updateFlyer);
router.delete("/:id", deleteFlyer);
router.post("/create-single",createSingleProdctFlyer);
router.post("/send-flyer" , sendFlyer)
export default router;
