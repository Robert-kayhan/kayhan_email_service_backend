import { Request, Response } from "express";
// import User from "../models/User";
import Vehicle from "../../models/bookingSystem/Vehicle";
import Booking from "../../models/bookingSystem/Booking";
import BookingItem from "../../models/bookingSystem/BookingItem";
import MobileInstallationDetail from "../../models/bookingSystem/MobileInstallationDetail";
import User from "../../models/User.model";
import Payment from "../../models/bookingSystem/Payment";
import JobReport from "../../models/bookingSystem/JobReport";
import { generatePremiumInvoicePdf } from "../../utils/booking/generateInvoicePdf";
import { Op } from "sequelize";
import { sendPaymentEmailForBooking } from "../../utils/booking/sendPaymentEmailForBooking";

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

    if(totalAmount >= paymentDetails.partialAmount){
      res.status(400).json({
        message : "You can't more then total value"
      })
    }

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
      // Determine the initial status
      let status: "Pending" | "Completed" | "Cancelled" = "Pending";
      let paidAmount = 0; // initial

      // If already fully paid
      if (paidAmount === (totalAmount.totalAmount || 0)) {
        status = "Completed";
      }

      // If payment type is Full, mark fully paid
      if (
        paymentDetails.type === "Full" &&
        paymentDetails.category !== "Later"
      ) {
        paidAmount = totalAmount.totalAmount || 0;
        status = "Completed";
      }
      if (paymentDetails.type === "Partial" ||paymentDetails.type === "Already Paid" ) {
        paidAmount = paymentDetails.partialAmount;
      }
      console.log(paymentDetails.category , "check this ")
      if (paymentDetails.category == "Later") {
        console.log("this is working ")
        sendPaymentEmailForBooking({
          customerEmail: userData.email,
          customerName: userData.firstname,
          bookingId: bookingRecord.id,
          amount:totalAmount.totalAmount ,
          paymentLink: `https://kayhanaudio.com.au/booking-checkout/${bookingRecord.id}`,
        });
      }
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
        paidAmount,
        status, // dynamically set status
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

    console.log(invoiceUrl, "this is invoice url");
    res.status(201).json({ success: true, booking: bookingRecord });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get all bookings with related data

export const getAllBookings = async (req: Request, res: Response) => {
  try {
    // pagination
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "10", 10);
    const offset = (page - 1) * limit;

    // filters
    const search = (req.query.search as string) || "";
    const status = (req.query.status as string) || "";
    const type = (req.query.type as string) || "";
    const paymentStatus = (req.query.paymentStatus as string) || "";

    // date filters (DATEONLY)
    const startDate = req.query.startDate as string; // YYYY-MM-DD
    const endDate = req.query.endDate as string; // YYYY-MM-DD

    // dynamic where clause
    const where: any = {};

    if (status) where.status = status;
    if (type) where.type = type;
    if (paymentStatus) where.paymentStatus = paymentStatus; // only if you have this column

    // search invoiceNumber/notes
    if (search) {
      where[Op.or] = [
        { invoiceNumber: { [Op.like]: `%${search}%` } },
        { notes: { [Op.like]: `%${search}%` } },
      ];
    }

    // ✅ date filter (use `date` column, not createdAt)
    if (startDate && endDate) {
      where.date = {
        [Op.between]: [startDate, endDate],
      };
    } else if (startDate) {
      where.date = {
        [Op.gte]: startDate,
      };
    } else if (endDate) {
      where.date = {
        [Op.lte]: endDate,
      };
    }

    // include relations
    const include = [
      {
        model: User,
        where: search
          ? {
              [Op.or]: [
                { firstname: { [Op.like]: `%${search}%` } },
                { lastname: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
              ],
            }
          : undefined,
        required: false,
      },
      { model: Vehicle },
      { model: BookingItem },
      { model: MobileInstallationDetail },
      { model: Payment, as: "payment" },
    ];

    // query
    const { count, rows: bookings } = await Booking.findAndCountAll({
      where,
      include,
      order: [
        ["date", "DESC"],
        ["time", "DESC"],
      ],
      limit,
      offset,
      distinct: true,
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
    console.error(error);
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
        // { model: JobReport },
        { model: MobileInstallationDetail },
        { model: Payment, as: "payment" },
        { model: JobReport, as: "reports" },
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

export const updatePayment = async (req: Request, res: Response) => {
  const { bookingId } = req.params;
  const { methods, paidAmount } = req.body;
  console.log(req.body , req)
  try {
    // Find existing payment
    const payment = await Payment.findOne({ where: { bookingId } });
    if (!payment) {
      res.status(404).json({ error: "Payment not found" });
      return;
    }

    // Convert amounts to numbers
    const previousPaid = parseFloat(payment.paidAmount.toString()) || 0;
    const newPaid = parseFloat(paidAmount) || 0;
    const totalAmount = parseFloat(payment.totalAmount.toString());

    // Prevent overpayment
    if (previousPaid + newPaid > totalAmount) {
      res.status(400).json({
        error: `Payment exceeds total amount. Remaining: ${(
          totalAmount - previousPaid
        ).toFixed(2)}`,
      });
    }

    const updatedPaidAmount = previousPaid + newPaid;

    // Determine payment status
    const status = updatedPaidAmount >= totalAmount ? "Completed" : "Pending";

    // Update payment
    await payment.update({
      methods, // update method(s)
      paidAmount: updatedPaidAmount,
      status,
    });

    res.status(200).json({
      message: "Payment updated successfully",
      payment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update payment" });
  }
};
