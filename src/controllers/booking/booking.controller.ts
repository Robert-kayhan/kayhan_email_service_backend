import { Request, Response } from "express";
// import User from "../models/User";
import Vehicle from "../../models/bookingSystem/Vehicle";
import Booking from "../../models/bookingSystem/Booking";
import BookingItem from "../../models/bookingSystem/BookingItem";
import MobileInstallationDetail from "../../models/bookingSystem/MobileInstallationDetail";
import User from "../../models/user/User.model";
import Payment from "../../models/bookingSystem/Payment";
import JobReport from "../../models/bookingSystem/JobReport";
import { generatePremiumInvoicePdf } from "../../utils/booking/generateInvoicePdf";
import { Op, where } from "sequelize";
import { sendPaymentEmailForBooking } from "../../utils/booking/sendPaymentEmailForBooking";
import { sendInstallationConfirmationEmail } from "../../utils/booking/sendInstallationConfirmationEmail";
import PaymentHistory from "../../models/bookingSystem/PaymentHistory";
export const createBooking = async (req: Request, res: Response) => {
  console.log(req.body, "this is data");

  try {
    const {
      userData,
      vehicle,
      booking,
      items,
      mobileDetails,
      paymentDetails,
      totalAmount,
      discountAmount,
    } = req.body;
    console.log(totalAmount, "this is total amount");
    // if(  paymentDetails.type !== "Full" || totalAmount >= Number(paymentDetails.partialAmount)){
    //   console.log("its call")
    //   res.status(400).json({
    //     message : "You can't more then total value"
    //   })
    // }

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
      if (
        paymentDetails.type === "Partial" ||
        paymentDetails.type === "Already Paid"
      ) {
        paidAmount = paymentDetails.partialAmount;
      }
      // If already fully paid
      if (Number(paidAmount) === (totalAmount || 0)) {
        status = "Completed";
      }

      // If payment type is Full, mark fully paid
      if (
        paymentDetails.type === "Full" &&
        paymentDetails.category !== "Later"
      ) {
        paidAmount = totalAmount || 0;
        status = "Completed";
      }

      console.log(paymentDetails.category, "check this ");
      if (paymentDetails.category == "Later") {
        console.log("this is working ");
        sendPaymentEmailForBooking({
          customerEmail: userData.email,
          customerName: userData.firstname,
          bookingId: bookingRecord.id,
          amount: totalAmount,
          paymentLink: `https://kayhanaudio.com.au/booking-checkout/${bookingRecord.id}`,
        });
      }
      await Payment.create({
        bookingId: bookingRecord.id,
        category: paymentDetails.category,
        methods: paymentDetails.methods || [],
        type: paymentDetails.type,
        partialAmount: paymentDetails.partialAmount || null,
        totalAmount: totalAmount || 0,
        discountType: paymentDetails.discountType,
        discountValue: paymentDetails.discountValue,
        discountAmount: discountAmount,
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
      console.log(userData, booking);
    }
    await sendInstallationConfirmationEmail({
      customerName: userData.firstname,
      customerEmail: userData.email,
      installationDate: booking.date,
      installationTime: booking.time,
    });
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
    // Pagination
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "10", 10);
    const offset = (page - 1) * limit;

    // Filters
    const search = (req.query.search as string) || "";
    const status = (req.query.status as string) || "";
    const type = (req.query.type as string) || "";
    const paymentStatus = (req.query.paymentStatus as string) || "";

    // Date filters (YYYY-MM-DD)
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    } else if (startDate) {
      where.date = { [Op.gte]: startDate };
    } else if (endDate) {
      where.date = { [Op.lte]: endDate };
    }

    // Include relations
    const include = [
      { model: User, required: false },
      { model: Vehicle },
      { model: BookingItem },
      { model: MobileInstallationDetail },
      { model: Payment, as: "payment" },
    ];

    // Search across Booking and User
    if (search) {
      where[Op.or] = [
        { invoiceNumber: { [Op.like]: `%${search}%` } },
        { notes: { [Op.like]: `%${search}%` } },
        { "$User.firstname$": { [Op.like]: `%${search}%` } },
        { "$User.lastname$": { [Op.like]: `%${search}%` } },
        { "$User.email$": { [Op.like]: `%${search}%` } },
      ];
    }

    // Query
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
      subQuery: false, // ✅ Needed for User field search
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
        { model: MobileInstallationDetail },
        {
          model: Payment,
          as: "payment",
          include: [
            {
              model: PaymentHistory,
              as: "histories", // must match alias defined in associations
            },
          ],
        },
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
    const {
      userData,
      vehicle,
      booking,
      items,
      mobileDetails,
      totalAmount,
      discount,
    } = req.body;
    console.log(req.body, "this is items");
    // console.log(req.body , "this is body")
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



    console.log(totalAmount, "this is new amount ");

    await BookingItem.destroy({ where: { bookingId: id } });
    if (items && items.length > 0) {
      await BookingItem.bulkCreate(
        items.map((item: any) => ({
          bookingId: id,
          itemType: item.itemType,
          charge: item.charge,
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
    const fullBooking: any = await Booking.findOne({
      where: { id: bookingRecord.id },
      include: [
        { model: User },
        { model: Vehicle },
        { model: BookingItem },
        { model: MobileInstallationDetail },
        { model: Payment, as: "payment" },
      ],
    });
    console.log(
      fullBooking?.payment?.paidAmount === totalAmount ,
      "this is contiond"
    );
   if (fullBooking?.payment && fullBooking.payment.paidAmount >= totalAmount) {
    console.log("this is call")
   res.status(400).json({
    success: false,
    error: "You have already paid more than the updated total amount",
  });
  return
}

    await Payment.update(
      {
        totalAmount: totalAmount,
        status:
          fullBooking?.payment?.paidAmount == totalAmount
            ? "Completed"
            : "Pending",
        discountValue: discount,
      },
      {
        where: {
          bookingId: bookingRecord.id,
        },
      }
    );
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

  try {
    // Find existing payment
    const payment = await Payment.findOne({ where: { bookingId } });
    if (!payment) {
      res.status(404).json({ error: "Payment not found" });
      return;
    }

    // Convert amounts to numbers safely
    const previousPaid = parseFloat(payment.paidAmount?.toString() || "0");
    const newPaid = parseFloat(paidAmount || "0");
    const totalAmount = parseFloat(payment.totalAmount?.toString() || "0");

    // ✅ Prevent overpayment
    if (previousPaid + newPaid > totalAmount) {
      res.status(400).json({
        error: `Payment exceeds total amount. Remaining: ${(
          totalAmount - previousPaid
        ).toFixed(2)}`,
      });
      return;
    }

    const updatedPaidAmount = previousPaid + newPaid;

    // Determine payment status
    const status = updatedPaidAmount >= totalAmount ? "Completed" : "Pending";

    // ✅ Update payment record
    await payment.update({
      methods, // payment method(s)
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
