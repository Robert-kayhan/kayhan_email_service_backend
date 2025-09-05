import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {s3Client} from "../config/S3BuketConfig"
// import s3Client from "../config/S3BuketConfig";
// S3 client setup
// const s3Client = new S3Client({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//   },
// });

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
  firstProduct: {
    image: string;
    price?: number | string;
    title: string;
  };
  secondProduct: {
    image: string;
    price?: number | string;
    title: string;
  };
  specs: Array<{ feature: string; p1: string; p2: string }>;
}) => {
  console.log("this is calls pdf ");
  // console.log(flyerData , firstProduct , secondProduct)
  const html = `
<html>
<head>
<meta charset="utf-8" />
<style>
  body {
    font-family: Arial, sans-serif;
    font-size: 11px;
    margin: 0;
    padding: 20px;
    background: #f3f4f6;
    color: #374151;
  }
  .container {
    max-width: 900px;
    margin: auto;
    background: white;
    border-radius: 1rem;
    box-shadow: 0 10px 15px rgba(0,0,0,0.1);
    padding: 20px;
    transform-origin: top left;
    transform: scale(0.9);
  }
  .header {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    border-bottom: 2px solid #e5e7eb;
    padding-bottom: 8px;
  }
  .header-left img {
    height: 50px;
    object-fit: contain;
  }
  .header-left h2 {
    margin-top: 6px;
    font-size: 1.1rem;
    font-weight: 600;
    color: #4b5563;
  }
  .customer-info {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px 12px;
    font-size: 0.8rem;
    background: #f9fafb;
    border-radius: 8px;
    padding: 8px 12px;
    box-shadow: inset 0 0 4px rgba(0,0,0,0.05);
  }
  .customer-info div {
    display: flex;
    gap: 6px;
    align-items: center;
  }
  .customer-info svg {
    width: 12px;
    height: 12px;
    fill: #6b7280;
    flex-shrink: 0;
  }
  .products {
    display: flex;
    gap: 16px;
    margin: 16px 0;
  }
  .product-card {
    flex: 1 1 45%;
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    padding: 10px;
    text-align: center;
    border-width: 3px;
    height: 150px; /* reduced height */
  }
  .product-card img {
    height: 90px; /* reduced image height */
    object-fit: contain;
    margin-bottom: 8px;
  }
  .price {
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 2px;
  }
  .price.purple { color:rgb(188, 188, 219); }
  .price.yellow { color:rgb(26, 21, 17); }
  .product-name {
    text-transform: uppercase;
    font-weight: 600;
    font-size: 0.75rem;
    color: #4b5563;
  }
  .order-button {
    margin-top: 8px;
    background-color:rgb(6, 6, 7);
    color: white;
    border: none;
    padding: 4px 10px;
    border-radius: 0.375rem;
    font-size: 0.7rem;
    cursor: pointer;
  }
  .table-container {
    overflow-x: auto;
    box-shadow: 0 4px 6px rgba(24, 21, 185, 0.1);
    margin-top: 12px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.75rem;
  }
  thead {
    background-color: rgb(41, 18, 141);
    color: white;
  }
  th, td {
    border: 1px solid #d1d5db;
    padding: 6px 8px;
    text-align: center;
  }
  th:first-child, td:first-child {
    text-align: left;
  }
  .footer {
    background-color: #1f2937;
    color: white;
    padding: 9px;
    border-radius: 0.75rem;
    font-size: 0.75rem;
    margin-top: 16px;
  }
  .footer-row {
    display: flex;
    align-items: center;
    gap: 3px;
    margin-bottom: 6px;
  }
  .footer-row svg {
    width: 12px;
    height: 12px;
    fill: white;
  }
</style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="header-left">
        <img src="${"https://kayhanaudio.com.au/_next/image?url=%2Flogo.webp&w=128&q=75"}" alt="Kayhan Logo" />
        
      </div>
      <div class="customer-info">
        <div><svg viewBox="0 0 24 24"><path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/></svg>${
          flyerData.customerName
        }</div>
        <div><svg viewBox="0 0 24 24"><path d="M6.62 10.79a15.46 15.46 0 006.59 6.59l2.2-2.2 3.55.57v3.49c0 .55-.45 1-1 1C10.29 21 3 13.71 3 4c0-.55.45-1 1-1h3.5v3.55L6.62 10.79z"/></svg>${
          flyerData.customerPhone
        }</div>
        <div><svg viewBox="0 0 24 24"><path d="M20 4H4a2 2 0 00-2 2v12c0 1.11.9 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.1-.89-2-2-2zM4 8l8 5 8-5"/></svg>${
          flyerData.customerEmail
        }</div>
        <div><svg viewBox="0 0 24 24"><path d="M3 6l9 6 9-6v12H3z"/></svg>Install: $${
          flyerData.installationFees
        }</div>
        <div><svg viewBox="0 0 24 24"><path d="M3 6l9 6 9-6v12H3z"/></svg>Delivery: $${
          flyerData.deliveryFees
        }</div>
        <div><svg viewBox="0 0 24 24"><path d="M5 8h14v2H5zm0 4h14v2H5z"/></svg>Quote #: ${
          flyerData.quotationNumber
        }</div>
        <div><svg viewBox="0 0 24 24"><path d="M12 7V3m0 18v-4m-9-5h4m10 0h4"/></svg>Valid: ${
          flyerData.validationTime
        }</div>
      </div>
    </div>

    <!-- Products -->
    <div class="products">
      <div class="product-card" style="border-color:#7c3aed">
        <img src="${firstProduct.image}" alt="${firstProduct.title}" />
        <div class="product-name">${firstProduct.title}</div>
      </div>
      <div class="product-card" style="border-color:#fbbf24">
        <img src="${secondProduct.image}" alt="${secondProduct.title}" />
        <div class="product-name">${secondProduct.title}</div>
      </div>
    </div>

    <!-- Comparison Table -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Feature</th>
            <th>${firstProduct.title}</th>
            <th>${secondProduct.title}</th>
          </tr>
        </thead>
        <tbody>
          ${specs
            .map(
              (s) => `
            <tr>
              <td>${s.feature}</td>
              <td>${s.p1}</td>
              <td>${s.p2}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-row"><svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>Unit 2/153 Dalgety Rd, Laverton North VIC 3026</div>
      <div class="footer-row"><svg viewBox="0 0 24 24"><path d="M20 4H4v12h16V4z"/></svg>support@kayhanaudio.com.au</div>
      <div class="footer-row"><svg viewBox="0 0 24 24"><path d="M6.62 10.79a15.46 15.46 0 006.59 6.59"/></svg>1300 696 488</div>
    </div>
  </div>
</body>
</html>
`;
  console.log("🚀 Starting flyer PDF generation");

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Wait for images to load
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

    // Local temp path
    const pdfDir = path.join(process.cwd(), "pdfs");
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
    console.log("📂 PDF directory ready:", pdfDir);

    const pdfFileName = `email-compagin${Date.now()}.pdf`;
    const pdfPath = path.join(pdfDir, pdfFileName);
    console.log("📄 Generating PDF at:", pdfPath);

    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin: { top: "0px", bottom: "0px", left: "0px", right: "0px" },
      preferCSSPageSize: true,
    });

    console.log("✅ PDF generated successfully");

    // Read file buffer
    const fileBuffer = fs.readFileSync(pdfPath);
    console.log("📏 PDF size (bytes):", fileBuffer.length);

    // Upload to S3
    const bucketName = process.env.S3_BUCKET!;
    const key = `flyers/${pdfFileName}`;
    console.log("📡 Preparing upload:", {
      bucketName,
      region: process.env.AWS_REGION,
      key,
    });

    try {
      console.log(key , fileBuffer)
      const response = await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: fileBuffer,
          ContentType: "application/pdf",
          ContentLength: fileBuffer.length,
        })
      );
      console.log("✅ S3 upload success:", response);
    } catch (s3Error: any) {
      console.error("❌ S3 upload failed:", s3Error);
      throw s3Error;
    }

    // Clean up local file
    fs.unlinkSync(pdfPath);

    // Return public URL
    const fileUrl = `${process.env.AWS_FILE_URL}flyers/${pdfFileName}`;
    console.log("🌍 File available at:", fileUrl);
    return fileUrl;
  } catch (error) {
    console.error("❌ PDF generation/upload error:", error);
    throw new Error("PDF generation failed");
  } finally {
    await browser.close();
    console.log("🛑 Browser closed");
  }
};
