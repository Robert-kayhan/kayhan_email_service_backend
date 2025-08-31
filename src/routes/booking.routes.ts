import { Router } from "express";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
//   sendNotification,
} from "../controllers/booking.controller";

const router = Router();

router.post("/", createBooking);
router.get("/", getAllBookings);
router.get("/:id", getBookingById);
router.put("/:id", updateBooking);
router.delete("/:id", deleteBooking);
// router.post("/notify", sendNotification);

export default router;
