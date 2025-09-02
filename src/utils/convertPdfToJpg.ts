import { fromPath } from "pdf2pic";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import axios from "axios";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// --- Download with retry ---
const downloadFile = async (url: string, outputPath: string) => {
  const writer = fs.createWriteStream(outputPath);

  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
    timeout: 60000, // 60s to avoid EPIPE on slow networks
  });

  return new Promise<string>((resolve, reject) => {
    response.data.pipe(writer);

    writer.on("finish", () => resolve(outputPath));
    writer.on("error", (err) => {
      writer.close();
      reject(err);
    });
  });
};

const convertPdfToJpg = async (pdfUrl: string) => {
  const tempDir = path.join(__dirname, "temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  const pdfPath = path.join(tempDir, `flyer-${Date.now()}.pdf`);
  console.log(pdfPath)
  
  try {
    // Step 1: Download
    await downloadFile(pdfUrl, pdfPath);

    // Step 2: Convert
    const pdf2pic = fromPath(pdfPath, {
      density: 150, // lower density -> less memory
      saveFilename: "flyer",
      savePath: tempDir,
      format: "jpg",
      width: 1200,
      height: 1200,
    });

    const result: any = await pdf2pic(1); // convert page 1
    if (!result.base64) throw new Error("Conversion failed");

    const jpgBuffer = Buffer.from(result.base64, "base64");

    // Step 3: Upload to S3
    const s3Key = `flyers/images/flyer-${Date.now()}.jpg`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: s3Key,
        Body: jpgBuffer,
        ContentType: "image/jpeg",
      })
    );

    // Step 4: Cleanup
    await fs.promises.unlink(pdfPath).catch(() => {});
    if (result.path && fs.existsSync(result.path)) {
      await fs.promises.unlink(result.path).catch(() => {});
    }

    return [`${process.env.AWS_FILE_URL}${s3Key}`];
  } catch (err: any) {
    console.error("❌ Conversion failed:", err);
    throw err;
  }
};

export default convertPdfToJpg;
