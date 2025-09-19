import express from "express"
import { createAfterpayOrder } from "../../controllers/payments/afterPay"
const router = express.Router()

router.post("/create",createAfterpayOrder)


export default router