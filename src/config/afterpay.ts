import axios from "axios";

const AFTERPAY_CLIENT_ID = process.env.AFTERPAY_CLIENT_ID!;
const AFTERPAY_CLIENT_SECRET = process.env.AFTERPAY_CLIENT_SECRET!;
const AFTERPAY_API = process.env.AFTERPAY_API || "https://api-sandbox.afterpay.com";

// Base64 encode client_id:client_secret
const authToken = Buffer.from(
  `${AFTERPAY_CLIENT_ID}:${AFTERPAY_CLIENT_SECRET}`
).toString("base64");

// Create axios instance with Basic Auth header
export const afterpayClient = axios.create({
  baseURL: AFTERPAY_API,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Basic ${authToken}`,
  },
});
