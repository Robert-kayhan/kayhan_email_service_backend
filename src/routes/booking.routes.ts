import { Router } from "express";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  //   sendNotification,
} from "../controllers/booking.controller";
import { uploadImage } from "../middlewares/Upload";
const router = Router();

router.post("/", uploadImage.fields([{ name: "file", maxCount: 1 }, { name: "image", maxCount: 1 }]), createBooking);  

router.get("/", getAllBookings);
router.get("/:id", getBookingById);
router.put("/:id", updateBooking);
router.delete("/:id", deleteBooking);
// router.post("/notify", sendNotification);

export default router;
