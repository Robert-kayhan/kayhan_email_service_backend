import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

export const generateStyledFlyerPdf = async ({
  flyerData,
  firstProduct,
  secondProduct,
  specs,
}: {
  flyerData: any;
  firstProduct: any;
  secondProduct: any;
  specs: Array<{ feature: string; p1: string; p2: string }>;
}) => {
  const html = `
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
        .header { background: #652D90; color: white; padding: 10px; text-align: center; font-size: 18px; }
        .customer-info { padding: 20px; font-size: 14px; }
        .products { display: flex; justify-content: space-around; padding: 20px; gap: 20px; }
        .product { text-align: center; width: 45%; }
        .product img { max-width: 200px; height: auto; }
        .product .price { color: red; font-size: 16px; font-weight: bold; margin: 5px 0; }
        .spec-header { background: #D95E0F; color: white; padding: 8px; text-align: center; font-size: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ccc; padding: 6px; font-size: 12px; text-align: center; }
        th { background: #333; color: white; }
        tr:nth-child(even) { background: #f7f7f7; }
        .footer { background: #652D90; color: white; text-align: center; padding: 10px; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">www.kayhanaudio.com.au</div>

      <div class="customer-info">
        <p><b>Customer Name:</b> ${flyerData.customerName}</p>
        <p><b>Phone:</b> ${flyerData.customerPhone}</p>
        <p><b>Email:</b> ${flyerData.customerEmail}</p>
        <p><b>Installation Fees:</b> $${flyerData.installationFees}</p>
        <p><b>Delivery Fees:</b> $${flyerData.deliveryFees}</p>
        <p><b>Quotation #:</b> ${flyerData.quotationNumber}</p>
        <p><b>Valid Until:</b> ${flyerData.validationTime}</p>
      </div>

      <div class="products">
        <div class="product">
          <img src="${firstProduct.image}" />
          <div class="price">$${firstProduct.price || ""}</div>
          <div>${firstProduct.title}</div>
        </div>
        <div class="product">
          <img src="${secondProduct.image}" />
          <div class="price">$${secondProduct.price || ""}</div>
          <div>${secondProduct.title}</div>
        </div>
      </div>

      <div class="spec-header">Specifications Comparison Table</div>
      <table>
        <tr>
          <th>Feature</th>
          <th>${firstProduct.title}</th>
          <th>${secondProduct.title}</th>
        </tr>
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
      </table>

      <div class="footer">
        Installation & Headunits on Display at Unit 3/15 Darlot Rd, Landsdale North VIC 3062, Australia<br/>
        support@kayhanaudio.com.au | 1300 696 488
      </div>
    </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    headless: true, // "new" only if Puppeteer >= 19
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  // Wait for all images to load
  await page.evaluate(() => {
    const promises = Array.from(document.images).map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    });
    return Promise.all(promises);
  });

  // Save PDF
  const pdfDir = path.join(process.cwd(), "pdfs");
  if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

  const pdfPath = path.join(pdfDir, `flyer-${Date.now()}.pdf`);
  await page.pdf({ path: pdfPath, format: "A4", printBackground: true });

  await browser.close();
  return pdfPath;
};