import express from "express"
import { receiveOrder } from "../../controllers/Inventory/order.controller";
const router = express.Router()


router.route("/").post(receiveOrder)

export default router;