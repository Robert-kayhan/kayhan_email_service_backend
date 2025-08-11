// routes/flyerRoutes.ts
import { Router } from "express";
import {
  createsFlyer,
  getAllFlyers,
  getFlyerById,
  updateFlyer,
  deleteFlyer,
} from "../controllers/flyer.Controller";

const router = Router();
const createFlyer = async (req: Request, res: Response) => {
  // res.send("ok");
};
// router.route("/").post(createFlyer)
router.get("/", getAllFlyers);
router.post("/", createsFlyer);
router.get("/:id", getFlyerById);
router.put("/:id", updateFlyer);
router.delete("/:id", deleteFlyer);

export default router;
