import express from "express";
import {
  createAfterpayOrder,
  confirmAfterpayOrder,
} from "../../controllers/payments/afterPay";
const router = express.Router();

router.post("/create", createAfterpayOrder);
router.post("/confrim-payment", confirmAfterpayOrder);

export default router;
