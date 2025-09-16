import { Router } from "express";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  //   sendNotification,
} from "../../controllers/booking/booking.controller";
import {createJobReport , rescheduleJob , cancelJob} from "../../controllers/booking/JobReport.controller"
import { uploadImage } from "../../middlewares/Upload";
const router = Router();

router.post("/", uploadImage.fields([{ name: "file", maxCount: 1 }, { name: "image", maxCount: 1 }]), createBooking);  

router.get("/", getAllBookings);
router.get("/:id", getBookingById);
router.put("/:id", updateBooking);
router.delete("/:id", deleteBooking);
// router.post("/notify", sendNotification);

router.post("/job-report",createJobReport);
router.put("/job-report/:id",rescheduleJob);
router.put("/job-report/:id",cancelJob);


export default router;
