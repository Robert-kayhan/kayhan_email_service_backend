import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
// import User from "../models/User.model";
import Admin from "../models/Admin";
interface DecodedToken {
  id: number;
  iat: number;
  exp: number;
}

const protect = async(req: any, res: Response, next: NextFunction) => {
  const token = req.cookies.jwt;

  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    const user = await Admin.findByPk(decoded.id)
    console.log(user?.email , decoded.id)
    req.user = { id: decoded.id , email : user?.email}; 
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

export default protect;
