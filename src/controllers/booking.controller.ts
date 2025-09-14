import { Request, Response } from "express";
// import User from "../models/User";
import Vehicle from "../models/bookingSystem/Vehicle";
import Booking from "../models/bookingSystem/Booking";
import BookingItem from "../models/bookingSystem/BookingItem";
import MobileInstallationDetail from "../models/bookingSystem/MobileInstallationDetail";
// import Notification from "../models/Notification";
import User from "../models/User.model";
import Payment from "../models/bookingSystem/Payment";
import { generatePremiumInvoicePdf } from "../utils/booking/generateInvoicePdf";
// ✅ Create a new booking (with User, vehicle, items, and mobile details)
export const createBooking = async (req: Request, res: Response) => {
  try {
    const {
      userData,
      vehicle,
      booking,
      items,
      mobileDetails,
      paymentDetails,
      totalAmount,
    } = req.body;
    console.log(req.body);
    // console.log(booking, "this is booking");
    // console.log(userData, "this is userdata");
    // console.log(items, "this is items");
    // console.log(mobileDetails, "this is mobile");
    // console.log(items , "this is items")

    // Create / find User
    //  console.log("Uploaded files:", req.files);

    let userRecord = await User.findOne({ where: { phone: userData.phone } });
    if (!userRecord) {
      userRecord = await User.create(userData);
    }

    // Create vehicle
    const vehicleRecord = await Vehicle.create({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      vinNumber: vehicle.vin,
      currentStereo: vehicle.currentStereo,
      dashPhotosUrl: vehicle.dashPhotosUrl,
      customerId: userRecord.id,
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
          itemType: item.name,
          charge: item.charge,
          // otherItemText: item.otherItemText,
        }))
      );
    }

    // Create mobile details if installation type = Mobile
    if (booking.type === "Mobile" && mobileDetails) {
      await MobileInstallationDetail.create({
        bookingId: bookingRecord.id,
        parkingRestrictions: mobileDetails.parking,
        powerAccess: mobileDetails.powerAccess,
        specialInstructions: mobileDetails.instructions,
        pickupAddress: mobileDetails.pickup,
        pickupLat: mobileDetails.pickupLocation.lat,
        pickupLng: mobileDetails.pickupLocation.lng,
        dropoffAddress: mobileDetails.drop,
        dropoffLat: mobileDetails.dropLocation.lat,
        dropoffLng: mobileDetails.dropLocation.lat,
        routeDistance: mobileDetails.distance,
        routeDuration: mobileDetails.duration,
        routePolyline: mobileDetails.routePolyline,
      });
    }
    if (paymentDetails && totalAmount) {
      await Payment.create({
        bookingId: bookingRecord.id,
        category: paymentDetails.category,
        methods: paymentDetails.methods || [],
        type: paymentDetails.type,
        partialAmount: paymentDetails.partialAmount || null,
        totalAmount: totalAmount.totalAmount || 0,
        discountType: totalAmount.discountType,
        discountValue: totalAmount.discountValue,
        discountAmount: totalAmount.discountAmount,
        paidAmount: 0,
      });
    }
    const fullBooking = await Booking.findOne({
      where: { id: bookingRecord.id },
      include: [
        { model: User },
        { model: Vehicle },
        { model: BookingItem },
        { model: MobileInstallationDetail },
        { model: Payment, as: "payment" },
      ],
    });

    // 8️⃣ Generate Invoice PDF
    let invoiceUrl = null;
    if (fullBooking) {
      invoiceUrl = await generatePremiumInvoicePdf({ booking: fullBooking });
    }
    console.log(invoiceUrl , "this is invoice url")
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
        { model: User }, // add alias if used in association
        { model: Vehicle },
        { model: BookingItem },
        { model: MobileInstallationDetail },
        { model: Payment, as: "payment" },
      ],
    });

    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found" });
      return;
    }

    res.json({ success: true, booking });
  } catch (error: any) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Update booking
export const updateBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userData, vehicle, booking, items, mobileDetails } = req.body;
    console.log(items, "this is items");
    // Find booking
    const bookingRecord = await Booking.findByPk(id);
    if (!bookingRecord) {
      res.status(404).json({ success: false, message: "Booking not found" });
      return;
    }

    // ✅ Update / create user
    let userRecord = await User.findOne({ where: { phone: userData.phone } });
    if (!userRecord) {
      userRecord = await User.create(userData);
    } else {
      await userRecord.update(userData);
    }

    // ✅ Update / create vehicle
    let vehicleRecord = await Vehicle.findOne({
      where: { id: bookingRecord.vehicleId },
    });
    if (vehicleRecord) {
      await vehicleRecord.update({ ...vehicle, customerId: userRecord.id });
    } else {
      vehicleRecord = await Vehicle.create({
        ...vehicle,
        customerId: userRecord.id,
      });
    }

    // ✅ Normalize booking payload
    const bookingPayload = {
      ...booking,
      type: booking.installationType, // map frontend → backend
      date: booking.preferredDate, // map frontend → backend
      customerId: userRecord.id,
      vehicleId: vehicleRecord.id,
    };

    // ✅ Update booking
    await bookingRecord.update(bookingPayload);

    // ✅ Update booking items
    await BookingItem.destroy({ where: { bookingId: id } });
    if (items && items.length > 0) {
      await BookingItem.bulkCreate(
        items.map((item: any) => ({
          bookingId: id,
          itemType: item.itemType,
          charge: item.charge,
          // otherItemText: item.otherItemText,
        }))
      );
    }

    // ✅ Update / create mobile details
    if (booking.installationType === "Mobile" && mobileDetails) {
      const detail = await MobileInstallationDetail.findOne({
        where: { bookingId: id },
      });

      const mobilePayload: any = {
        bookingId: id,
        parkingRestrictions: mobileDetails.parking,
        powerAccess: mobileDetails.powerAccess,
        specialInstructions: mobileDetails.instructions,
        pickupAddress: mobileDetails.pickup,
        pickupLat: mobileDetails.pickupLocation?.lat,
        pickupLng: mobileDetails.pickupLocation?.lng,
        dropoffAddress: mobileDetails.drop,
        dropoffLat: mobileDetails.dropLocation?.lat,
        dropoffLng: mobileDetails.dropLocation?.lng,
        routeDistance: mobileDetails.distance,
        routeDuration: mobileDetails.duration,
        routePolyline: mobileDetails.routePolyline,
      };

      if (detail) {
        await detail.update(mobilePayload);
      } else {
        await MobileInstallationDetail.create(mobilePayload);
      }
    }

    res.json({ success: true, booking: bookingRecord });
  } catch (error: any) {
    console.error(error);
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
      return;
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
