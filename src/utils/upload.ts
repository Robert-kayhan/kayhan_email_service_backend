import multer from "multer";
import multerS3 from "multer-s3";
import s3 from "../config/S3BuketConfig";

export const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME!,
    acl: "public-read", // or "private"
    key: (req, file, cb) => {
      const fileName = `uploads/${Date.now()}_${file.originalname}`;
      cb(null, fileName);
    },
  }),
});
