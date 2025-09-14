import express, { Request, Response } from "express";
import { uploadImage } from "../middlewares/Upload";
import { uploadToS3 } from "../config/S3BuketConfig";

const router = express.Router();

interface MulterRequest extends Request {
  file: Express.Multer.File;
}

// POST /api/vehicle-photo
// import { Router, Response } from "express";
// import { uploadToS3 } from "../../utils/s3"; // your helper function
// import uploadImage from "../../middlewares/multer"; // multer config

// const router = Router();

router.post("/",
  uploadImage.array("photos", 10), // allow up to 10 files, field name: "photos"
  async (req, res: Response) => {
    try {
      console.log("api call")
      if (!req.files || !(req.files instanceof Array) || req.files.length === 0) {
         res.status(400).json({ success: false, message: "No files uploaded" });
         return
      }

      const files = req.files as Express.Multer.File[];

      // Upload each file to S3
      const uploadPromises = files.map((file) =>
        uploadToS3(file.buffer, file.originalname, file.mimetype)
      );

      const urls = await Promise.all(uploadPromises);
      console.log(urls , "this is urls")
      res.json({
        success: true,
        message: "Photos uploaded successfully",
        urls,
      });
    } catch (err: unknown) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: (err as Error).message || "Server error",
      });
    }
  }
);

export default router;


