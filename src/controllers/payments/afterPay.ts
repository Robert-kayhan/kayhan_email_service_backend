import { Request, Response } from "express";
import { afterpayClient } from "../../config/afterpay";

export const createAfterpayOrder = async (req: Request, res: Response) => {
  try {
    const { booking } = req.body;

    if (!booking || !booking.payment) {
      return res.status(400).json({ error: "Missing booking/payment data" });
    }

    const amount = booking.payment.partialAmount || booking.payment.totalAmount;

    const payload = {
      amount: {
        amount: amount,
        currency: "AUD", // change to your store currency
      },
      merchantReference: `BOOKING-${booking.id}`,
      consumer: {
        givenNames: booking.User.firstname,
        surname: booking.User.lastname,
        email: booking.User.email,
        phoneNumber: booking.User.phone,
      },
      billing: {
        name: `${booking.User.firstname} ${booking.User.lastname}`,
        line1: booking.User.street || "No Street",
        suburb: booking.User.city || "NA",
        state: booking.User.state || "NA",
        postcode: booking.User.postcode || "0000",
        countryCode: booking.User.country || "AU",
      },
      shipping: {
        name: `${booking.User.firstname} ${booking.User.lastname}`,
        line1: booking.MobileInstallationDetail?.pickupAddress || "NA",
        suburb: booking.User.city || "NA",
        state: booking.User.state || "NA",
        postcode: booking.User.postcode || "0000",
        countryCode: booking.User.country || "AU",
      },
      items: booking.BookingItems.map((item: any) => ({
        name: item.itemType,
        price: {
          amount: item.charge,
          currency: "AUD",
        },
        quantity: 1,
        sku: `ITEM-${item.id}`,
      })),
      returnUrl: `${process.env.CLIENT_URL}/afterpay/confirmation?bookingId=${booking.id}`,
      cancelUrl: `${process.env.CLIENT_URL}/afterpay/cancel?bookingId=${booking.id}`,
    };

    const response = await afterpayClient.post("/v2/checkouts", payload);

    return res.json({
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

    const response = await afterpayClient.post(`/v2/payments/capture`, {
      token,
    });

    // TODO: Update your DB `payment` record here
    // Mark booking.payment.paidAmount = amount
    // Set status = "Paid"

    res.json({
      success: true,
      payment: response.data,
    });
  } catch (error: any) {
    console.error("Afterpay Capture Error:", error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data || "Failed to capture Afterpay payment",
    });
  }
};
