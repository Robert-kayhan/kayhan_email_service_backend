import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface DecodedToken {
  id: number;
  iat: number;
  exp: number;
}

const protect = (req: any, res: Response, next: NextFunction) => {
  const token = req.cookies.jwt;

  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    req.user = { id: decoded.id }; // attach user to request
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

export default protect;
