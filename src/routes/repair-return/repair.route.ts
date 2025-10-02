import express from "express"
import {  createOrder,
  getOrders,
  getOrderDetail,
  updateOrder,
  addNote,  deleteOrder} from "../../controllers/repair-return/repairTicket.Controller"
const router = express.Router()
router.post("/", createOrder);
router.get("/", getOrders);
router.get("/:id", getOrderDetail);
router.put("/:id", updateOrder);
router.post("/note/:id", addNote);
router.delete("/:id",deleteOrder)

export default router