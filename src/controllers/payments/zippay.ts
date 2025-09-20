import { Request, Response } from "express";
import axios from "axios";
import Payment from "../../models/bookingSystem/Payment";
import Booking from "../../models/bookingSystem/Booking";

const ZIP_PAY_URL = process.env.ZIP_PAY_URL!;
const ZIP_PAY_API_KEY = process.env.ZIP_PAY_API_KEY!;

export const createZipPayment = async (req: Request, res: Response) => {
  console.log("api call", req.body);
  try {
    const { uuid } = req.body;

    // Fetch booking with related info
    const booking: any = await Booking.findByPk(uuid, {
      include: ["User", "BookingItems", "payment"],
    });
    // console.log(booking , "this is booking ")
    if (!booking) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }
    console.log(booking.BookingItems, "this is booking item");
    // Build payload for Zip
    const payload = {
      // merchantId: ZIP_PAY_MERCHANT_ID,
      // redirectUrl: successUrl,
      // cancelUrl,
      order: {
        amount: booking.payment.totalAmount,
        currency: "AUD",
        items: booking.BookingItems.map((item: any) => ({
          name: item.itemType,
          quantity: 1,
          price: item.charge,
        })),
      },
      shopper: {
        email: booking.User.email,
        firstName: booking.User.firstname,
        lastName: booking.User.lastname,
        phone: booking.User.phone,
      },
      config: {
        redirect_uri: `${process.env.FRONTEND_URL}payment-verify/zip/${booking.id}?amount=${booking.payment.totalAmount}`,
      },
    };

    // Call Zip API
    const response = await axios.post(
      `${ZIP_PAY_URL}/checkouts`,
      {
        shopper: {
          // title : ""
          email: booking.User.email,
          firstName: booking.User.firstname,
          lastName: booking.User.lastname,
          phone: booking.User.phone,
        },
        order: {
          reference: booking.id,
          amount: booking.payment.totalAmount,
          currency: "AUD",
        },
        config: {
          redirect_uri: `${process.env.FRONTEND_URL}/booking-payment-verfiy/zip/${booking.id}?amount=${booking.payment.totalAmount}`,
        },
      },
      {
        headers: {
          accept: "application/json",
          "Zip-Version": "2021-08-25",
          Authorization: `Bearer ${ZIP_PAY_API_KEY}`,
          //  'User-Agent' : ""
        },
      }
    );

    console.log("response.data", response.data);

    res.json({ redirectUrl: response.data.uri }); // Afterpay payment page URL

    // Response from Zip (contains redirectUri)
    // const { redirectUri, id: checkoutId } = zipResp.data;

    // (Optional) Save checkoutId to your Payment record for later verification

    // res.json({ redirectUrl: redirectUri, checkoutId });
  } catch (err: any) {
    // console.log(err);
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Zip Pay payment creation failed" });
  }
};


export const capturePayment = async (req: Request, res: Response) => {
  try {
    const { orderId, checkout_id, amount } = req.body;

    // 1️⃣ create charge in Zip
    const response = await axios.post(
      `${ZIP_PAY_URL}/charges`,
      {
        authority: {
          type: "checkout_id",
          value: checkout_id,
        },
        reference: orderId,
        amount,
        currency: "AUD",
        capture: false,
      },
      {
        headers: {
          accept: "application/json",
          "Zip-Version": "2021-08-25",
          Authorization: `Bearer ${ZIP_PAY_API_KEY}`,
        },
      }
    );

    // 2️⃣ capture charge
    const captureRes = await axios.post(
      `${ZIP_PAY_URL}/charges/${response.data.id}/capture`,
      {
        amount,
        currency: "AUD",
        is_partial_capture: false,
      },
      {
        headers: {
          accept: "application/json",
          "Zip-Version": "2021-08-25",
          Authorization: `Bearer ${ZIP_PAY_API_KEY}`,
          "idempotency-key": orderId,
        },
      }
    );

    // 3️⃣ update Payment record if captured
    if (captureRes.data.state === "captured") {
      // find the payment by bookingId (or orderId if that’s your FK)
      const payment:any = await Payment.findOne({
        where: { bookingId: orderId },
      });

      if (payment) {
        payment.status = "Completed"; // ✅ update status
        payment.paidAmount = amount;  // ✅ update paid amount
        await payment.save();
      }

      res.json({
        success: true,
        message: "Payment successful",
        redirectUrl: `${process.env.WEB_URL}/payment-successful/${orderId}`,
      });
    } else {
      // not captured → optionally mark it failed
      await Payment.update(
        { status: "Cancelled" },
        { where: { bookingId: orderId } }
      );

      res.status(400).json({
        success: false,
        message: "Payment not approved",
        data: captureRes.data,
      });
    }
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
};
