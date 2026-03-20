import { Request, Response } from "express";
import * as XLSX from "xlsx";
import { Op, Sequelize } from "sequelize";
import axios from "axios";
import User from "../../models/user/User.model";

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
    role,
    interest
  } = req.body;
  console.log("api call", req.body);
  try {
    const existingUser = await User.findOne({
      where: { [Op.or]: [{ email }] },
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
      role : role || 0,
      interest
      // country,
    });
    res.status(201).json({ message: "User created successfully." });
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ message: "Something went wrong while creating the user." });
  }
};

const createMultipleUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "Please upload a file" });
      return;
    }

    // ✅ read type from FormData field
    const type = (req.body?.type || "").toString().trim().toLowerCase();
    const userType = type === "wholesale" ? 3 : 0; // set your default

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
          email: safeTrim(row["Email"]).toLowerCase(),
          phone: phone || null,
          country: safeTrim(row["Mailing Country"]),
          state: safeTrim(row["Mailing State"]),
          city: safeTrim(row["Mailing City"]),
          street: safeTrim(row["Mailing Street"]),
          postcode: safeTrim(row["Mailing Zip"]),
          role: userType, // ✅ ADD THIS
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
      type: userType, // optional: return what type was used
    });
  } catch (error: any) {
    console.error("Bulk upload error:", error);

    res.status(500).json({
      message: "Failed to upload users.",
      error: error.message,
      details: error.errors ?? null,
    });
  }
};
const getALLUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string)?.trim() || "";
    const role = req.query.role ? Number(req.query.role) : 0; // role filter
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};
    if (search) {
      whereClause[Op.or] = [
        { firstname: { [Op.like]: `%${search}%` } },
        { lastname: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    if (role !== null) {
      whereClause.role = role; // Add role filter
    }

    const { count, rows: users } = await User.findAndCountAll({
      attributes: [
        "id",
        "firstname",
        "lastname",
        "email",
        "phone",
        "role",
        "createdAt",
        "isSubscribed"
      ],
      where: whereClause,
      order: [["id", "DESC"]],
      limit,
      offset,
    });

    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: `${user.firstname} ${user.lastname}`,
      email: user.email,
      phone: user.phone,
      role: user.role == 0 ? "User" : "Wholesale",
      status: "Active",
      isSubscribed: user.isSubscribed ? true : false
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
    const userId = req.params.id;
    const body = req.body || {};

    const {
      firstname,
      lastname,
      phone,
      address,
      role,
      email,
      isSubscribed,
      interest,
    } = body;

    console.log("params id =>", userId);
    console.log("req.body =>", req.body);

    const user = await User.findByPk(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (firstname !== undefined) user.firstname = firstname;
    if (lastname !== undefined) user.lastname = lastname;
    if (phone !== undefined) user.phone = phone;
    // if (address !== undefined) user.address = address;
    if (role !== undefined) user.role = role;
    if (email !== undefined) user.email = email;
    if (isSubscribed !== undefined) user.isSubscribed = isSubscribed;
    if (interest !== undefined) user.interest = interest;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
    });
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
    await User.destroy({
      where: {
        firstname: 'UNKNOWN USER',
        lastname: 'UNKNOWN USER'
      }
    });
    // 1️⃣ Fetch external users
    const externalResponse = await axios.get(
      "https://api.kayhanaudio.com.au/v1/users/all"
    );
    const externalUsers = externalResponse.data;
    // console.log(externalResponse , "this is expternal response")
    if (!Array.isArray(externalUsers)) {
      res.status(400).json({ message: "Invalid external users format" });
      return
    }

    // 2️⃣ Optional: search filter
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

    // 3️⃣ Find existing leads by email
    const emails = filteredUsers.map((u: any) => u.email).filter(Boolean);
    const existingLeads = await User.findAll({
      where: { email: { [Op.in]: emails } },
      attributes: ["id", "email"],
    });

    const existingLeadEmailSet = new Set(existingLeads.map((l) => l.email));

    // 4️⃣ Create missing users (new leads)
    const newUsersToCreate = filteredUsers.filter(
      (user: any) => user.email && !existingLeadEmailSet.has(user.email)
    );

    if (newUsersToCreate.length > 0) {

      await User.bulkCreate(
        newUsersToCreate.map(({ name, last_name, email, phone }) => ({
          firstname: name || "",
          lastname: last_name || "",
          email: email,
          phone: phone || null,
          source: "external_api", // optional: mark where they came from
        })),
        { ignoreDuplicates: true } // avoids race-condition duplicates
      );
    }

    // 5️⃣ Re-fetch leads (now includes newly created)
    const allLeads = await User.findAll({
      where: { email: { [Op.in]: emails } },
      attributes: ["email"],
    });

    const allLeadEmailSet = new Set(allLeads.map((l) => l.email));

    // 6️⃣ Attach hasLead flag
    const combinedUsers = filteredUsers.map((user: any) => ({
      ...user,
      hasLead: allLeadEmailSet.has(user.email),
    }));

    // 7️⃣ Filter hasLeadOnly if requested
    let finalUsers = combinedUsers;
    if (hasLeadOnly) {
      finalUsers = combinedUsers.filter((u: any) => u.hasLead);
    }

    // 8️⃣ Paginate
    const total = finalUsers.length;
    const paginatedUsers = finalUsers.slice(offset, offset + limit);

    // 🧹 Delete duplicate users (keep the newest one)
    const duplicates = await User.findAll({
      attributes: ["email"],
      where: {
        email: { [Op.ne]: null }
      },
      group: ["email"],
      having: Sequelize.literal("COUNT(email) > 1"),
    });

    // Convert duplicates to array of emails
    const duplicateEmails = duplicates.map((d) => d.email);

    if (duplicateEmails.length > 0) {
      for (const email of duplicateEmails) {
        const usersWithSameEmail = await User.findAll({
          where: { email },
          order: [["createdAt", "ASC"]], // oldest first
        });

        // Keep last one (newest)
        const usersToDelete = usersWithSameEmail.slice(0, -1);

        // Delete all older duplicates
        for (const u of usersToDelete) {
          await User.destroy({ where: { id: u.id } });
        }
      }
    }

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

const normalizeStringField = (val: any): string | null => {
  if (!val) return null;
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return val.join(", "); // join array into string
  if (typeof val === "object") return JSON.stringify(val); // fallback for object
  return val.toString();
};

import https from "https";


const httpsAgent = new https.Agent({
  family: 4, // force IPv4
  keepAlive: true,
});

const axiosInstance = axios.create({
  baseURL: "https://api.kayhanaudio.com.au/v1",
  timeout: 30000,
  httpsAgent,
  headers: {
    Accept: "application/json",
    "User-Agent": "Kayhan-Backend/1.0",
  },
});

const createAllWholesaleUsers = async (req: Request, res: Response) => {
  console.log("🚀 Sync wholesale users started");

  try {
    // 1️⃣ Fetch wholesale users (pagination recommended)
    const response = await axiosInstance.get("/users", {
      params: { role: 3, limit: 500, page: 1 },
    });

    const externalUsers = response.data?.data?.result ?? [];

    if (externalUsers.length === 0) {
      res.status(404).json({ message: "No wholesale users found" });
      return;
    }

    // 2️⃣ Normalize users
    const usersToUpsert = externalUsers.map((u: any) => ({
      firstname: normalizeStringField(u.name) || "UNKNOWN",
      lastname: normalizeStringField(u.last_name) || "",
      email: normalizeStringField(u.email),
      phone: normalizeStringField(u.phone),
      country: normalizeStringField(u.country),
      state: normalizeStringField(u.state),
      city: normalizeStringField(u.city),
      street: normalizeStringField(u.street),
      postcode: normalizeStringField(u.postcode),
      role: u.role ?? 3,
      isSubscribed: u.isSubscribed ?? true,
    }));

    // 3️⃣ Get all emails that already exist
    const emails = usersToUpsert.map((u: any) => u.email).filter(Boolean);

    const existingUsers = await User.findAll({
      where: { email: emails },
      attributes: ["email"],
    });

    const existingEmails = new Set(existingUsers.map(u => u.email));

    // 4️⃣ Filter out users whose email already exists
    const newUsers = usersToUpsert.filter((u: any) => !existingEmails.has(u.email));

    if (newUsers.length === 0) {
      res.status(200).json({ message: "No new users to create" });
      return;
    }

    // 5️⃣ Bulk create in batches
    const BATCH_SIZE = 500;
    for (let i = 0; i < newUsers.length; i += BATCH_SIZE) {
      const batch = newUsers.slice(i, i + BATCH_SIZE);
      await User.bulkCreate(batch);
    }

    res.status(200).json({
      message: `Created ${newUsers.length} new wholesale users successfully`,
    });
  } catch (error: any) {
    console.error("❌ Sync error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};


 const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || isNaN(Number(id))) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
      return;
    }

    // Find user
    const user = await User.findByPk(id , {
      attributes : {exclude : ["password"]}
    });

    // If not found
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Success response
    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error: any) {
    console.error("Error fetching user:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
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
  createAllWholesaleUsers,
  getUserById
};
