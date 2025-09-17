import axios from "axios";
const AFTERPAY_CLIENT_ID = process.env.AFTERPAY_CLIENT_ID;
const AFTERPAY_CLIENT_SECRET = process.env.AFTERPAY_CLIENT_SECRET;
const authToken = Buffer.from(
  `${AFTERPAY_CLIENT_ID}:${AFTERPAY_CLIENT_SECRET}`
).toString("base64");

const AFTERPAY_API = process.env.AFTERPAY_API || "https://api-sandbox.afterpay.com"; // sandbox for testing
const AFTERPAY_KEY = process.env.AFTERPAY_KEY as string;
const AFTERPAY_SECRET = process.env.AFTERPAY_SECRET as string;

export const afterpayClient = axios.create({
  baseURL: AFTERPAY_API,
  auth: {
    username: AFTERPAY_KEY,
    password: AFTERPAY_SECRET,
  },
  headers: {
    "Content-Type": "application/json",
  },
});
