import multer from "multer";
import path from "path";

// Store in memory or disk (choose memory if you parse immediately)
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
  const ext = path.extname(file.originalname);
  if (ext !== ".xlsx" && ext !== ".xls") {
    return cb(new Error("Only Excel files are allowed"), false);
  }
  cb(null, true);
};

export const upload = multer({ storage, fileFilter });
