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

export { createOneUser, createMultipleUser };
