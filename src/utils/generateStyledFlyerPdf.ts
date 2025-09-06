import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { uploadToS3 } from "../config/S3BuketConfig";

export const generateStyledFlyerPdf = async ({
  flyerData,
  firstProduct,
  secondProduct,
  specs,
}: {
  flyerData: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    installationFees: number;
    deliveryFees: number;
    quotationNumber: string;
    validationTime: string;
    logoUrl?: string;
  };
  firstProduct: { image: string; price?: number | string; title: string };
  secondProduct: { image: string; price?: number | string; title: string };
  specs: Array<{ feature: string; p1: string; p2: string }>;
}) => {
  console.log("🚀 PDF generation called");

  // ✅ ENV sanity check
  if (!process.env.S3_BUCKET) throw new Error("❌ Missing S3_BUCKET env var");
  if (!process.env.AWS_FILE_URL) console.warn("⚠️ AWS_FILE_URL not set");

  // ✅ Start puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // 🔽 Build your HTML (same as before)...
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <style>
          /* keep your CSS */
        </style>
      </head>
      <body>
        <!-- keep your flyer markup -->
      </body>
      </html>
    `;

    await page.setContent(html, { waitUntil: "networkidle0" });

    // ✅ Wait for images to load
    await page.evaluate(() => {
      const imgs = Array.from(document.images);
      return Promise.all(
        imgs.map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((res) => {
                img.onload = res;
                img.onerror = res;
              })
        )
      );
    });

    // ✅ Generate PDF locally
    const pdfDir = path.resolve(__dirname, "../../pdfs");
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

    const pdfFileName = `flyer-${Date.now()}.pdf`;
    const pdfPath = path.join(pdfDir, pdfFileName);

    console.log("📄 Generating PDF at:", pdfPath);
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin: { top: "0px", bottom: "0px", left: "0px", right: "0px" },
      preferCSSPageSize: true,
    });

    // ✅ Buffer read
    if (!fs.existsSync(pdfPath)) throw new Error("❌ PDF not created");
    const fileBuffer = fs.readFileSync(pdfPath);

    console.log("📏 PDF size:", fileBuffer.length);

    // ✅ Upload via your reusable function
    const fileUrl = await uploadToS3(
      fileBuffer,
      pdfFileName,
      "application/pdf",
      // "flyers" 
    );

    console.log("🌍 Uploaded to S3:", fileUrl);

    // ✅ Clean local file
    fs.unlinkSync(pdfPath);

    return fileUrl;
  } catch (err) {
    console.error("❌ PDF generation error:", err);
    throw err;
  } finally {
    await browser.close();
    console.log("🛑 Browser closed");
  }
};
