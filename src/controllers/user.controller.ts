import { Request, Response } from "express";
import User from "../models/User.model";
import * as XLSX from "xlsx";
import { Op } from "sequelize";
import sendError from "../utils/SendResponse";
import axios from "axios";
const createOneUser = async (req: Request, res: Response): Promise<void> => {
  const {
    firstname,
    lastname,
    email,
    phone,
    country,
    state,
    city,
    street,
    postcode,
  } = req.body;

  try {
    const existingUser = await User.findOne({
      where: { [Op.or]: [{ email }, { phone }] },
    });

    if (existingUser) {
      res
        .status(400)
        .json({ message: "User already exists with this email or phone." });
      return;
    }

    const address = [street, city, state, postcode, country]
      .filter(Boolean)
      .join(", ");

    await User.create({
      firstname,
      lastname,
      email,
      phone,
      street,
      city,
      state,
      postcode,
      country,
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
    if (!req.file) {
      res.status(400).json({ message: "Please upload a file" });
      return;
    }

    const workBook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workBook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json<any>(workBook.Sheets[sheetName]);

    const safeTrim = (val: any): string =>
      typeof val === "string" || typeof val === "number"
        ? val.toString().trim()
        : "";

    const allProcessedRows = sheetData
      .map((row) => {
        let phone = safeTrim(row["Phone"]).replace(/[^0-9+]/g, "");
        if (phone.length > 20) phone = phone.slice(0, 20);

        return {
          firstname: safeTrim(row["First Name"]),
          lastname: safeTrim(row["Last Name"]),
          email: safeTrim(row["Email"]).toLowerCase(), // Normalize here
          phone: phone || null,
          country: safeTrim(row["Mailing Country"]),
          state: safeTrim(row["Mailing State"]),
          city: safeTrim(row["Mailing City"]),
          street: safeTrim(row["Mailing Street"]),
          postcode: safeTrim(row["Mailing Zip"]),
          isDeleted: false,
          isActive: true,
        };
      })
      .filter((row) => row.firstname && row.lastname && row.email);

    if (allProcessedRows.length === 0) {
      res.status(400).json({ message: "No valid data found in sheet" });
      return;
    }

    const emails = allProcessedRows.map((row) => row.email.toLowerCase());
    const existingUsers = await User.findAll({
      attributes: ["email"],
      where: { email: { [Op.in]: emails } },
    });

    // Normalize email case for comparison
    const existingEmailSet = new Set(
      existingUsers.map((u) => u.email.toLowerCase())
    );

    const newUsers = allProcessedRows.filter(
      (row) => !existingEmailSet.has(row.email.toLowerCase())
    );

    if (newUsers.length === 0) {
      res.status(200).json({
        message: "No new users to create. All emails already exist.",
      });
      return;
    }

    const BATCH_SIZE = 1000;
    for (let i = 0; i < newUsers.length; i += BATCH_SIZE) {
      const batch = newUsers.slice(i, i + BATCH_SIZE);
      await User.bulkCreate(batch, { validate: true });
    }

    res.status(200).json({
      message: `Upload complete. ${newUsers.length} new users created.`,
    });
  } catch (error: any) {
    console.error("Bulk upload error:", error);

    if (error?.errors) {
      console.error("Validation Errors:", error.errors);
    }

    res.status(500).json({
      message: "Failed to upload users.",
      error: error.message,
      details: error.errors ?? null,
    });
  }
};


const getALLUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Default values if query params are not passed
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      attributes: [
        "id",
        "firstname",
        "lastname",
        "email",
        "phone",
        "role",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: `${user.firstname} ${user.lastname}`,
      email: user.email,
      phone: user.phone,
      role: user.role === 1 ? "Admin" : "User",
      status: "Active",
      // address: user.address,
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
    const { firstname, lastname, phone, address, role, email } = req.body;

    const user = await User.findOne({ where: { email: userId } }); // You can use `id` here if needed
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    user.firstname = firstname ?? user.firstname;
    user.lastname = lastname ?? user.lastname;
    user.phone = phone ?? user.phone;
    // user.address = address ?? user.address;
    user.role = role ?? user.role;
    user.email = email ?? user.email;

    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUsersWithLeadStatus = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = String(req.query.search || "").toLowerCase();
    const hasLeadOnly = req.query.hasLeadOnly === "true";

    // 1. Get external users
    const externalResponse = await axios.get(
      "https://api.kayhanaudio.com.au/v1/users/all"
    );
    const externalUsers = externalResponse.data;

    if (!Array.isArray(externalUsers)) {
      res.status(400).json({ message: "Invalid external users format" });
      return;
    }

    // 2. Filter by search term (optional)
    let filteredUsers = externalUsers;
    if (search) {
      filteredUsers = filteredUsers.filter((user: any) => {
        return (
          (user.name && user.name.toLowerCase().includes(search)) ||
          (user.last_name && user.last_name.toLowerCase().includes(search)) ||
          (user.email && user.email.toLowerCase().includes(search))
        );
      });
    }

    // 3. Get matching lead emails only for filtered users
    const emails = filteredUsers.map((u: any) => u.email).filter(Boolean);
    const leads = await User.findAll({
      where: { email: { [Op.in]: emails } },
      attributes: ["email"],
    });
    const leadEmailSet = new Set(leads.map((l) => l.email));

    // 4. Attach hasLead
    const combinedUsers = filteredUsers.map((user: any) => ({
      ...user,
      hasLead: leadEmailSet.has(user.email),
    }));

    // 5. Apply hasLeadOnly filter if requested
    let finalUsers = combinedUsers;
    if (hasLeadOnly) {
      finalUsers = combinedUsers.filter((u: any) => u.hasLead);
    }

    // 6. Paginate final list
    const total = finalUsers.length;
    const paginatedUsers = finalUsers.slice(offset, offset + limit);

    // 7. Send response
    res.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: paginatedUsers,
    });
  } catch (error) {
    console.error("Error fetching users with lead status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const unsubscribeUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.isSubscribed = false;
    await user.save();

    return res.status(200).json({
      message: "User unsubscribed successfully.",
      user: {
        id: user.id,
        email: user.email,
        isSubscribed: user.isSubscribed,
      },
    });
  } catch (error: any) {
    console.error("❌ Error unsubscribing user:", error);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

export {
  createOneUser,
  createMultipleUser,
  getALLUser,
  deleteUser,
  updateUser,
  getUsersWithLeadStatus,
  unsubscribeUser,
};
