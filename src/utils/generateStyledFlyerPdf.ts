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
    productOnePrice?: any;
  };
  firstProduct: { image: string; price?: number | string; title: string };
  secondProduct: { image: string; price?: number | string; title: string };
  specs: Array<{ feature: string; p1: string; p2: string }>;
}) => {
  console.log("🚀 PDF generation called");

  if (!process.env.S3_BUCKET) throw new Error("❌ Missing S3_BUCKET env var");
  if (!process.env.AWS_FILE_URL) console.warn("⚠️ AWS_FILE_URL not set");

  const safeSpecs = specs.slice(0, 20);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    await page.setViewport({
      width: 1240,
      height: 1754,
      deviceScaleFactor: 1,
    });

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    @page {
      size: A4;
      margin: 0;
    }

    * {
      box-sizing: border-box;
    }

    html, body {
      width: 210mm;
      height: 297mm;
      margin: 0;
      padding: 0;
      overflow: hidden;
      font-family: Arial, sans-serif;
      background: #f3f4f6;
      color: #374151;
    }

    body {
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }

    .page {
      width: 210mm;
      height: 297mm;
      padding: 8mm;
      background: #f3f4f6;
      overflow: hidden;
    }

    .container {
      width: 100%;
      height: 100%;
      background: #ffffff;
      border-radius: 10px;
      padding: 10px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 8px;
      margin-bottom: 8px;
      flex-shrink: 0;
    }

    .header-left {
      width: 110px;
      flex-shrink: 0;
    }

    .header-left img {
      width: 100%;
      max-height: 42px;
      object-fit: contain;
      display: block;
    }

    .customer-info {
      flex: 1;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 4px 12px;
      font-size: 10px;
      background: #f9fafb;
      border-radius: 8px;
      padding: 8px 10px;
      box-shadow: inset 0 0 4px rgba(0,0,0,0.04);
    }

    .customer-info div {
      display: flex;
      align-items: center;
      gap: 5px;
      min-width: 0;
      word-break: break-word;
    }

    .customer-info svg {
      width: 11px;
      height: 11px;
      fill: #6b7280;
      flex-shrink: 0;
    }

    .products {
      display: flex;
      gap: 10px;
      margin-bottom: 8px;
      flex-shrink: 0;
    }

    .product-card {
      flex: 1;
      min-height: 110px;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      padding: 8px;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .product-card.purple {
      border-color: #7c3aed;
    }

    .product-card.yellow {
      border-color: #fbbf24;
    }

    .product-card img {
      max-height: 50px;
      width: auto;
      max-width: 100%;
      object-fit: contain;
      margin-bottom: 6px;
      display: block;
    }

    .product-name {
      text-transform: uppercase;
      font-weight: 700;
      font-size: 10px;
      line-height: 1.2;
      color: #374151;
      margin-bottom: 3px;
      word-break: break-word;
    }

    .product-price {
      font-size: 10px;
      font-weight: 700;
      color: #6b7280;
    }

    .table-container {
      flex: 1;
      min-height: 0;
      overflow: hidden;
      margin-top: 2px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      font-size: 8.5px;
    }

    thead {
      background-color: rgb(41, 18, 141);
      color: white;
    }

    th, td {
      border: 1px solid #d1d5db;
      padding: 3px 4px;
      line-height: 1.15;
      vertical-align: middle;
      word-wrap: break-word;
      overflow-wrap: break-word;
      text-align: center;
    }

    th:first-child,
    td:first-child {
      text-align: left;
      width: 28%;
    }

    th:nth-child(2),
    td:nth-child(2),
    th:nth-child(3),
    td:nth-child(3) {
      width: 36%;
    }

    .footer {
      margin-top: 8px;
      background-color: #1f2937;
      color: white;
      padding: 8px 10px;
      border-radius: 10px;
      font-size: 9px;
      flex-shrink: 0;
    }

    .footer-row {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 4px;
      line-height: 1.2;
    }

    .footer-row:last-child {
      margin-bottom: 0;
    }

    .footer-row svg {
      width: 10px;
      height: 10px;
      fill: white;
      flex-shrink: 0;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="container">
      <div class="header">
        <div class="header-left">
          <img src="${"https://kayhanaudio.com.au/_next/image?url=%2Flogo.webp&w=128&q=75"}" alt="Kayhan Logo" />
        </div>

        <div class="customer-info">
          <div>
            <svg viewBox="0 0 24 24"><path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/></svg>
            ${flyerData.customerName ?? ""}
          </div>
          <div>
            <svg viewBox="0 0 24 24"><path d="M6.62 10.79a15.46 15.46 0 006.59 6.59l2.2-2.2 3.55.57v3.49c0 .55-.45 1-1 1C10.29 21 3 13.71 3 4c0-.55.45-1 1-1h3.5v3.55L6.62 10.79z"/></svg>
            ${flyerData.customerPhone ?? ""}
          </div>
          <div>
            <svg viewBox="0 0 24 24"><path d="M20 4H4a2 2 0 00-2 2v12c0 1.11.9 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.1-.89-2-2-2zM4 8l8 5 8-5"/></svg>
            ${flyerData.customerEmail ?? ""}
          </div>
          <div>
            <svg viewBox="0 0 24 24"><path d="M3 6l9 6 9-6v12H3z"/></svg>
            Install: $${flyerData.installationFees ?? 0}
          </div>
          <div>
            <svg viewBox="0 0 24 24"><path d="M3 6l9 6 9-6v12H3z"/></svg>
            Delivery: $${flyerData.deliveryFees ?? 0}
          </div>
          <div>
            <svg viewBox="0 0 24 24"><path d="M5 8h14v2H5zm0 4h14v2H5z"/></svg>
            Quote #: ${flyerData.quotationNumber ?? ""}
          </div>
          <div>
            <svg viewBox="0 0 24 24"><path d="M12 7V3m0 18v-4m-9-5h4m10 0h4"/></svg>
            Valid: ${flyerData.validationTime ?? ""}
          </div>
        </div>
      </div>

      <div class="products">
        <div class="product-card purple">
          <img src="${firstProduct.image}" alt="${firstProduct.title}" />
          <div class="product-name">${firstProduct.title ?? ""}</div>
          <div class="product-price">$${firstProduct.price ?? ""}</div>
        </div>

        <div class="product-card yellow">
          <img src="${secondProduct.image}" alt="${secondProduct.title}" />
          <div class="product-name">${secondProduct.title ?? ""}</div>
          <div class="product-price">$${secondProduct.price ?? ""}</div>
        </div>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>${firstProduct.title ?? ""}</th>
              <th>${secondProduct.title ?? ""}</th>
            </tr>
          </thead>
          <tbody>
            ${safeSpecs
              .map(
                (s) => `
                <tr>
                  <td>${s.feature ?? ""}</td>
                  <td>${s.p1 ?? ""}</td>
                  <td>${s.p2 ?? ""}</td>
                </tr>
              `
              )
              .join("")}
          </tbody>
        </table>
      </div>

      <div class="footer">
        <div class="footer-row">
          <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
          Unit 3, 151 Dohertys Rd, Laverton North, VIC 3026, Australia
        </div>
        <div class="footer-row">
          <svg viewBox="0 0 24 24"><path d="M20 4H4v12h16V4z"/></svg>
          support@kayhanaudio.com.au
        </div>
        <div class="footer-row">
          <svg viewBox="0 0 24 24"><path d="M6.62 10.79a15.46 15.46 0 006.59 6.59"/></svg>
          1300 696 488
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

    await page.setContent(html, { waitUntil: "networkidle0" });

    await page.evaluate(() => {
      const imgs = Array.from(document.images);
      return Promise.all(
        imgs.map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) return resolve(true);
              img.onload = () => resolve(true);
              img.onerror = () => resolve(true);
            })
        )
      );
    });

    const pdfDir = path.resolve(__dirname, "../../pdfs");
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    const pdfFileName = `flyer-${Date.now()}.pdf`;
    const pdfPath = path.join(pdfDir, pdfFileName);

    console.log("📄 Generating PDF at:", pdfPath);

    await page.pdf({
      path: pdfPath,
      printBackground: true,
      preferCSSPageSize: true,
      pageRanges: "1",
      scale: 1,
    });

    if (!fs.existsSync(pdfPath)) {
      throw new Error("❌ PDF not created");
    }

    const fileBuffer = fs.readFileSync(pdfPath);
    console.log("📏 PDF size:", fileBuffer.length);

    const fileUrl = await uploadToS3(
      fileBuffer,
      pdfFileName,
      "application/pdf"
    );

    console.log("🌍 Uploaded to S3:", fileUrl);

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