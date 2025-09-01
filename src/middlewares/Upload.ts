// src/middleware/upload.ts
import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const excelFilter = (req: any, file: any, cb: any) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== ".xlsx" && ext !== ".xls") {
    return cb(new Error("Only Excel files are allowed"), false);
  }
  cb(null, true);
};

const imageFilter = (req: any, file: any, cb: any) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExt = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  if (!allowedExt.includes(ext)) {
    return cb(new Error("Only image files are allowed"), false);
  }
  cb(null, true);
};

export const uploadExcel = multer({ storage, fileFilter: excelFilter });
export const uploadImage = multer({ storage, fileFilter: imageFilter });
