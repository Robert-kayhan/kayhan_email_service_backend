import jwt from "jsonwebtoken";
import { Response } from "express";

const createToken = (res: Response, id: any) => {
  try {
    const token = jwt.sign({ id }, process.env.JWT_SECRET!, {
      expiresIn: "30d",
    });

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: false, // HTTPS only in production
      sameSite: "strict", // Protects from CSRF
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
  } catch (error) {
    console.log("error", error);
  }
};

export default createToken;
