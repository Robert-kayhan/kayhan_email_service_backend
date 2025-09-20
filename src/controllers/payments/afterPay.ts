import { Request, Response } from "express";
import { afterpayClient } from "../../config/afterpay";
import Payment from "../../models/bookingSystem/Payment";
import axios from "axios";

/**
 * Create Afterpay checkout session and return redirect URL to client
 */
const AFTERPAY_CLIENT_ID = process.env.AFTERPAY_CLIENT_ID;

const AFTERPAY_API_URL =
  process.env.AFTERPAY_API_URL || "https://global-api.afterpay.com"; // or
const AFTERPAY_CLIENT_SECRET = process.env.AFTERPAY_CLIENT_SECRET;

const authToken = Buffer.from(
  `${AFTERPAY_CLIENT_ID}:${AFTERPAY_CLIENT_SECRET}`
).toString("base64");
export const createAfterpayOrder = async (req: Request, res: Response) => {
  try {
    const { booking } = req.body;
    if (!booking || !booking.payment) {
       res.status(400).json({ error: "Missing booking/payment data" });
       return
    }

    const amountValue = Number(booking.payment.totalAmount).toFixed(2);
    console.log(amountValue, "this is amount");
    // const payload: any = {
    //   amount: { amount: amountValue, currency: "AUD" },
    //   merchantReference: `BOOKING-${booking.id}`,
    //   consumer: {
    //     givenNames: booking.User.firstname,
    //     surname: booking.User.lastname,
    //     email: booking.User.email,
    //     phoneNumber: booking.User.phone,
    //   },
    //   items: booking.BookingItems.map((item: any) => ({
    //     name: item.itemType,
    //     price: { amount: Number(item.charge).toFixed(2), currency: "AUD" },
    //     quantity: 1,
    //     sku: `ITEM-${item.id}`,
    //   })),
    //   returnUrl: `${process.env.FRONTEND_URL}/afterpay/confirmation?bookingId=${booking.id}`,
    //   cancelUrl: `${process.env.FRONTEND_URL}/afterpay/cancel?bookingId=${booking.id}`,
    // };
    let consumer;
    console.log(booking, "this is booking ");
    if (booking) {
      const useDetail = booking.User;
      consumer = {
        givenNames: (useDetail as any).firstname,
        surname: (useDetail as any).lastname,
        email: (useDetail as any).email,
        countryCode: +61,
        phoneNumber: (useDetail as any).phone,
      };
    }
    const response = await axios.post(
      `${AFTERPAY_API_URL}/v2/checkouts`,
      {
        amount: { currency: "AUD",amount: amountValue },
        merchant: {
          redirectConfirmUrl: `${process.env.FRONTEND_URL}/payment-verify/${booking.id}`,
          // redirectCancelUrl: `${process.env.WEB_URL}/checkout`,
          redirectCancelUrl: `${process.env.FRONTEND_URL}/payment-verify/${booking.id}`,
        },

        consumer,
        merchantReference: booking.id,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${authToken}`,
          //  'User-Agent' : ""
          "User-Agent": `KayhanAudio/1.0.0 (Next.js/15.1.6; Node.js/20.17.0; Kayhan audio/${AFTERPAY_CLIENT_ID}) https://kayhanaudio.com.au`,
        },
      }
    );
    // const response = await afterpayClient.post("/v2/checkouts", payload);
    console.log(response);
    res.json({
      success: true,
      redirectUrl: response.data.redirectCheckoutUrl,
      token: response.data.token,
    });
  } catch (error: any) {
    console.error("Afterpay Error:", error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data || "Failed to create Afterpay order",
    });
  }
};

export const confirmAfterpayOrder = async (req: Request, res: Response) => {
  try {
    const { token, bookingId } = req.body;

    const response = await axios.get(
      `${AFTERPAY_API_URL}/v2/payments/${token}`, // Use the correct identifier
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${authToken}`,
             'User-Agent' :""
          // 'User-Agent': `KayhanAudio/1.0.0 (Next.js/15.1.6; Node.js/20.17.0; Kayhan audio/${AFTERPAY_CLIENT_ID}) https://kayhanaudio.com.au`

        },
      }
    );

    const paidAmount = parseFloat(response.data.amount?.amount || "0");

    const paymentRecord = await Payment.findOne({ where: { bookingId } });
    if (!paymentRecord) {
       res.status(404).json({ error: "Payment record not found" });
       return
    }

    const currentPaidAmount = Number(paymentRecord.paidAmount) || 0;
    const totalAmount = Number(paymentRecord.totalAmount) || 0;
    const newPaidAmount = currentPaidAmount + paidAmount;

    await paymentRecord.update({
      paidAmount: newPaidAmount,
      status:  "Completed" 
    });

    res.json({
      success: true,
      payment: paymentRecord,
      afterpayResponse: response.data,
    });
  } catch (error: any) {
    console.error(
      "Afterpay Capture Error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: error.response?.data || "Failed to capture Afterpay payment",
    });
  }
};
