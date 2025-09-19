import { Request, Response } from "express";
import axios from "axios";
import Payment from "../../models/bookingSystem/Payment";
import Booking from "../../models/bookingSystem/Booking";

const ZIP_PAY_URL = process.env.ZIP_PAY_URL!;
const ZIP_PAY_API_KEY = process.env.ZIP_PAY_API_KEY!;
const ZIP_PAY_MERCHANT_ID = process.env.ZIP_PAY_MERCHANT_ID!;

export const createZipPayment = async (req: Request, res: Response) => {
  try {
    const { bookingId, successUrl, cancelUrl } = req.body;

    // Fetch booking with related info
    const booking:any = await Booking.findByPk(bookingId, {
      include: ["User", "BookingItems", "payment"],
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // Build payload for Zip
    const payload = {
      merchantId: ZIP_PAY_MERCHANT_ID,
      redirectUrl: successUrl,
      cancelUrl,
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
    };

    // Call Zip API
    const zipResp = await axios.post(`${ZIP_PAY_URL}/checkout`, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ZIP_PAY_API_KEY}`, // or Basic if Zip uses client/secret
      },
    });

    // Response from Zip (contains redirectUri)
    const { redirectUri, id: checkoutId } = zipResp.data;

    // (Optional) Save checkoutId to your Payment record for later verification
    await Payment.update(
      { methods: ["Zip Pay"], status: "Pending" },
      { where: { bookingId } }
    );

    return res.json({ redirectUrl: redirectUri, checkoutId });
  } catch (err: any) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ error: "Zip Pay payment creation failed" });
  }
};
