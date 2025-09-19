import { Request, Response } from "express";
import axios from "axios";
import Payment from "../../models/bookingSystem/Payment";
const PAYPAL_API = process.env.PAYPAL_API!;
const CLIENT_ID = process.env.PAYPAL_CLIENT_ID!;
const SECRET = process.env.PAYPAL_SECRET!;

// ✅ Get OAuth2 Access Token
const getAccessToken = async (): Promise<string> => {
  const { data } = await axios.post(
    `${PAYPAL_API}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      auth: { username: CLIENT_ID, password: SECRET },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );
  return data.access_token;
};

// ✅ Create PayPal Order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const accessToken = await getAccessToken();
    const { booking } = req.body;
    console.log(booking)
    if (!booking || !booking.payment) {
       res.status(400).json({ error: "Missing booking/payment details" });
    }

    const orderPayload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "AUD", // or booking.payment.currency
            value: booking.payment.totalAmount,
          },
          description: `Booking #${booking.id} payment`,
        },
      ],
      application_context: {
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
        return_url: `${process.env.FRONTEND_URL}/payment/success`, 
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,  
      },
    };

    const { data } = await axios.post(`${PAYPAL_API}/v2/checkout/orders`, orderPayload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    res.json({ id: data.id }); // Send order ID to frontend
  } catch (err: any) {
    console.error("PayPal create order error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to create PayPal order" });
  }
};

// ✅ Capture PayPal Order
export const captureOrder = async (req: Request, res: Response) => {
  try {
    const accessToken = await getAccessToken();
    const { orderId, bookingId } = req.body;

    if (!orderId || !bookingId) {
       res.status(400).json({ error: "Missing orderId or bookingId" });
    }

    const { data } = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    await Payment.update({ status: "Completed" }, { where: { bookingId: bookingId }})
    // TODO: Update booking/payment status in your database
    // Example: Booking.update({ status: "Paid" }, { where: { id: bookingId } });

    res.json({ success: true, data });
  } catch (err: any) {
    console.error("PayPal capture order error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to capture PayPal order" });
  }
};
