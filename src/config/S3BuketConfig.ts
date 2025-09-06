import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.S3_BUCKET_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_BUCKET_SECRET_ACCESS_KEY!,
  },
});
export const uploadToS3 = async (
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
) => {
  const timestamp = Date.now(); // single timestamp
  const ext = fileName.split(".").pop(); // get the extension from original file
  const key = `email-compagin-${Date.now()}.${ext}`;
  console.log("this function call");
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: `flyers/${key}`,
    Body: fileBuffer,
    ContentType: mimeType,
    // ACL: "public-read"
  });

  await s3Client.send(command);

  // Return correct URL
  return `${process.env.AWS_FILE_URL}flyers/${key}`;
};
