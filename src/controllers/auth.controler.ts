import User from "../models/User.model";
import { Request, Response } from "express";
import createToken from "../utils/createToken";
import bcrypt from "bcryptjs";

// 👤 Register New User
const createUser = async (req: Request, res: Response): Promise<void> => {
  const { firstname, lastname, email, password, phone } = req.body;
    console.log("connect successfully")
  if (!firstname || !lastname || !email || !password || !phone) {
    res.status(400).json({ error: "Please fill all fields" });
    return;
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      phone,
    });

    createToken(res, user.id);

    res.status(201).json({
      message: "User registered successfully",
      data: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🔐 Login User
const Sign = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    createToken(res, user.id);

    res.status(200).json({
      message: "Logged in successfully",
      data: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMe = async (req: any, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({
      message: "Authenticated user",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

export { createUser, Sign , getMe };
