import express from "express"
import {  createOrder,
  getOrders,
  getOrderDetail,
  updateOrder,
  addNote, } from "../../controllers/repair-return/repairTicket.Controller"
const router = express.Router()
router.post("/", createOrder);
router.get("/list", getOrders);
router.get("/detail/:id", getOrderDetail);
router.put("/update/:id", updateOrder);
router.post("/note/:id", addNote);

export default router