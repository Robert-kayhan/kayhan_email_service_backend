import { Request, Response } from "express";
import User from "../models/User.model";
import * as XLSX from "xlsx";
import { Op } from "sequelize";
import sendError from "../utils/SendResponse";
const createOneUser = async (req: Request, res: Response): Promise<void> => {
  const { firstname, lastname, email, phone, address } = req.body;

  try {
    // Check if a user with the same email OR phone exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      res
        .status(400)
        .json({ message: "User already exists with this email or phone." });
      return;
    }

    // Create the user
    await User.create({
      firstname,
      lastname,
      email,
      phone,
      address,
      password: "", // You can hash/set a default password here if needed
    });

    res.status(201).json({ message: "User created successfully." });
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ message: "Something went wrong while creating the user." });
  }
};

const createMultipleUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) sendError(res, 404, "please upload file");

    const workBook = XLSX.read(req.file?.buffer, { type: "buffer" });
    const sheetName = workBook.SheetNames[0];
    const SheetData = XLSX.utils.sheet_to_json<any>(workBook.Sheets[sheetName]);

    const usersToCreate = [];

    for (const row of SheetData) {
      const firstname = row["First Name"];
      const lastname = row["Last Name"];
      const email = row["Email"];
      const phone = row["Phone"];
      const mailingStreet = row["Mailing Street"]?.trim() || "";
      const mailingCity = row["Mailing City"]?.trim() || "";
      const mailingState = row["Mailing State"]?.trim() || "";
      const mailingZip = row["Mailing Zip"]?.toString().trim() || "";
      const mailingCountry = row["Mailing Country"]?.trim() || "";

      const address = [
        mailingStreet,
        mailingCity,
        mailingState,
        mailingZip,
        mailingCountry,
      ]
        .filter(Boolean)
        .join(", ");
      if (!firstname || !lastname || !email || !phone || !address) continue; // Required

      const existing = await User.findOne({
        where: {
          [Op.or]: [{ email }, { phone }],
        },
      });
      if (!existing) {
        usersToCreate.push({
          firstname,
          lastname,
          email,
          phone,
          address,
        });
      }
    }
    if (usersToCreate.length > 0) {
      await User.bulkCreate(usersToCreate);
    }
    res.status(200).json({
      message: `Upload complete. ${usersToCreate.length} users created.`,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({ message: "Failed to upload users." });
  }
};



 const getALLUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Default values if query params are not passed
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      attributes: ["id", "firstname", "lastname", "email", "phone", "address", "role", "createdAt"],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const formattedUsers = users.map((user) => ({
      name: `${user.firstname} ${user.lastname}`,
      email: user.email,
      phone: user.phone,
      role: user.role === 1 ? "Admin" : "User",
      status: "Active", 
      address:user.address 
    }));

    res.status(200).json({
      data: formattedUsers,
      pagination: {
        totalItems: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id; // Ensure ID is an integer
    // if (isNaN(userId)) {
    //   res.status(400).json({ message: "Invalid user ID" });
    //   return;
    // }

    const deletedCount = await User.destroy({
      where: { email: userId },
    });

    if (deletedCount === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



 const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id; // You may use `email` instead of `id` if that's how you identify users
    const { firstname, lastname, phone, address, role,email } = req.body;

    const user = await User.findOne({ where: { email: userId } }); // You can use `id` here if needed
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    user.firstname = firstname ?? user.firstname;
    user.lastname = lastname ?? user.lastname;
    user.phone = phone ?? user.phone;
    user.address = address ?? user.address;
    user.role = role ?? user.role;
    user.email = email ?? user.email;

    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export { createOneUser, createMultipleUser , getALLUser , deleteUser , updateUser };
