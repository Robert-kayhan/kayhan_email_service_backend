import { Request, Response } from "express";
// import User from "../models/User";
import Vehicle from "../models/bookingSystem/Vehicle";
import Booking from "../models/bookingSystem/Booking";
import BookingItem from "../models/bookingSystem/BookingItem";
import MobileInstallationDetail from "../models/bookingSystem/MobileInstallationDetail";
// import Notification from "../models/Notification";
import User from "../models/User.model";
// ✅ Create a new booking (with User, vehicle, items, and mobile details)
export const createBooking = async (req: Request, res: Response) => {
  try {
    const {
      userData, 
      vehicle,
      booking,
      items,
      mobileDetails,
    } = req.body;
    console.log(booking , "this is booking")
    console.log(userData , "this is userdata")
    console.log(items , "this is items")
    console.log(mobileDetails , "this is mobile")
    // Create / find User
    let userRecord = await User.findOne({ where: { phone: userData.phone } });
    if (!userRecord) {
      userRecord = await User.create(userData);
    }

    // Create vehicle
    const vehicleRecord = await Vehicle.create({
      ...vehicle,
     customerId : userRecord.id,
    });

    // Create booking
    const bookingRecord = await Booking.create({
      ...booking,
      customerId: userRecord.id,
      vehicleId: vehicleRecord.id,
    });

    // Create booking items
    if (items && items.length > 0) {
      await BookingItem.bulkCreate(
        items.map((item: any) => ({
          bookingId: bookingRecord.id,
          itemType: item.itemType,
          otherItemText: item.otherItemText,
        }))
      );
    }

    // Create mobile details if installation type = Mobile
    if (booking.type === "Mobile" && mobileDetails) {
      await MobileInstallationDetail.create({
        bookingId: bookingRecord.id,
        ...mobileDetails,
      });
    }

    res.status(201).json({ success: true, booking: bookingRecord });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};


// ✅ Get all bookings with related data
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    // 🔹 Get page & limit from query, fallback defaults
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "10", 10);
    const offset = (page - 1) * limit;

    const { count, rows: bookings } = await Booking.findAndCountAll({
      include: [
        { model: User },
        { model: Vehicle },
        { model: BookingItem },
        { model: MobileInstallationDetail },
        // { model: Notification },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.json({
      success: true,
      bookings,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get booking by ID
export const getBookingById = async (req: Request, res: Response) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        { model: User },
        { model: Vehicle },
        { model: BookingItem },
        { model: MobileInstallationDetail },
        // { model: Notification },
      ],
    });

    if (!booking) {
       res.status(404).json({ success: false, message: "Booking not found" });
       return
    }

    res.json({ success: true, booking });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Update booking
export const updateBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { booking, items, mobileDetails } = req.body;

    const bookingRecord = await Booking.findByPk(id);
    if (!bookingRecord) {
       res.status(404).json({ success: false, message: "Booking not found" });
       return
    }

    await bookingRecord.update(booking);

    // Update booking items (simple: delete & recreate)
    if (items) {
      await BookingItem.destroy({ where: { bookingId: id } });
      await BookingItem.bulkCreate(
        items.map((item: any) => ({
          bookingId: id,
          itemType: item.itemType,
          otherItemText: item.otherItemText,
        }))
      );
    }

    // Update mobile details
    if (booking.type === "Mobile") {
      const detail = await MobileInstallationDetail.findOne({ where: { bookingId: id } });
      if (detail) {
        await detail.update(mobileDetails);
      } else {
        await MobileInstallationDetail.create({ bookingId: id, ...mobileDetails });
      }
    }

    res.json({ success: true, booking: bookingRecord });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Delete booking
export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByPk(id);

    if (!booking) {
       res.status(404).json({ success: false, message: "Booking not found" });
       return
    }

    await booking.destroy();
    res.json({ success: true, message: "Booking deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Send notification (for email/SMS)
// export const sendNotification = async (req: Request, res: Response) => {
//   try {
//     const { bookingId, channel, message } = req.body;

//     const notification = await Notification.create({
//       bookingId,
//       channel,
//       message,
//       sentAt: new Date(),
//       status: "Sent",
//     });

//     res.json({ success: true, notification });
//   } catch (error: any) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };
