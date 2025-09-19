import express from "express";
import { createOrder, captureOrder } from "../../controllers/payments/paypal";

const router = express.Router();

router.post("/create-payment", createOrder);
router.post("/capture-order", captureOrder);

export default router;
