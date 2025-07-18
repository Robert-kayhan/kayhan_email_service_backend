import jwt from "jsonwebtoken";
import { Response } from "express";

const createToken = (res: Response, id: any) => {
  try {
    const token = jwt.sign({ id }, process.env.JWT_SECRET!, {
      expiresIn: "30d",
    });

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true, 
      sameSite: "none", 
      maxAge: 30 * 24 * 60 * 60 * 1000, 
    });
    console.log("cokkie send")
  } catch (error) {
    console.log("error", error);
  }
};

export default createToken;
