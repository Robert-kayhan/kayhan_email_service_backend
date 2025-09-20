import express from "express"
import { createZipPayment ,capturePayment } from "../../controllers/payments/zippay"
const router = express.Router()

router.post("/create",createZipPayment)
router.post("/confirm",capturePayment)

export default router