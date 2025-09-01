import express, { Request, Response } from "express";
import { uploadImage } from "../middlewares/Upload";
import { uploadToS3 } from "../config/S3BuketConfig";

const router = express.Router();

interface MulterRequest extends Request {
  file: Express.Multer.File;
}

// POST /api/vehicle-photo
router.post("/", uploadImage.single("photo"), async (req, res: Response) => {
  try {
    if (!req.file) {
       res.status(400).json({ success: false, message: "No file uploaded" });
       return
    }

    const file = req.file;

    // Upload to S3
    const s3Url = await uploadToS3(file.buffer, file.originalname, file.mimetype);

    res.json({
      success: true,
      message: "Photo uploaded successfully",
      url: s3Url,
    });
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ success: false, message: (err as Error).message || "Server error" });
  }
});

export default router;
