// import fs from "fs";
// import path from "path";
// import axios from "axios";
// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// // eslint-disable-next-line @typescript-eslint/no-var-requires
// const pdfPoppler = require("pdf-poppler");

// // S3 client
// const s3Client = new S3Client({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY!,
//     secretAccessKey: process.env.AWSZ_SECRET_ACCESS_KEY!,
//   },
// });

// const convertPdfToJpg = async (pdfUrl: string) => {
//   // 1. Download PDF
//   const response = await axios.get(pdfUrl, { responseType: "arraybuffer" });
//   const pdfBuffer = Buffer.from(response.data);

//   const tempDir = path.join(process.cwd(), "temp");
//   if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

//   const timestamp = Date.now();
//   const pdfPath = path.join(tempDir, `flyer-${timestamp}.pdf`);
//   fs.writeFileSync(pdfPath, pdfBuffer);

//   // 2. Convert PDF → JPG
//   const prefix = `flyer-${timestamp}`; 
//   const options = {
//     format: "jpeg",
//     jpeg: 100,
//     out_dir: tempDir,
//     out_prefix: prefix,
//     page: null, // null = convert all pages
//     scale:  2048, // resolution
//   };

//   await pdfPoppler.convert(pdfPath, options);

//   // 3. Upload generated JPG(s) to S3
//   const files = fs.readdirSync(tempDir).filter((f) => f.startsWith(prefix) && f.endsWith(".jpg"));
//   const uploadedUrls: string[] = [];

//   for (const file of files) {
//     const fileBuffer = fs.readFileSync(path.join(tempDir, file));
//     const s3Key = `flyers/images/${file}`;

//     await s3Client.send(
//       new PutObjectCommand({
//         Bucket: process.env.S3_BUCKET!,
//         Key: s3Key,
//         Body: fileBuffer,
//         ContentType: "image/jpeg",
//       })
//     );

//     uploadedUrls.push(`${process.env.AWS_FILE_URL}${s3Key}`);

//     // delete temp jpg
//     fs.unlinkSync(path.join(tempDir, file));
//   }

//   // 4. Cleanup PDF file
//   fs.unlinkSync(pdfPath);

//   return uploadedUrls; 
// };

// export default convertPdfToJpg;
