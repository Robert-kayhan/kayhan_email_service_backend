import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import QRCode from "qrcode";
import { uploadToS3 } from "../../config/S3BuketConfig";
import { Invoice } from "../../models/bookingSystem/Invoice";
export const generatePremiumInvoicePdf = async ({
  booking,
}: {
  booking: any;
}) => {
  console.log("🚀 Generating premium invoice PDF");

  if (!process.env.S3_BUCKET) throw new Error("❌ Missing S3_BUCKET env var");

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // QR Code for Invoice
    const qrDataUrl = await QRCode.toDataURL(
      `Invoice#${booking.invoiceNumber}`
    );

    const total = booking.BookingItems.reduce(
      (acc: number, item: any) => acc + parseFloat(item.charge),
      0
    );

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

body {
  font-family: 'Inter', sans-serif;
  margin: 0;
  padding: 0;
  background: #f3f4f6;
  color: #111827;
  font-size: 13px;
}
.container {
  width: 100%;
  max-width: 860px;
  margin: auto;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 12px 28px rgba(0,0,0,0.08);
  overflow: hidden;
}

/* Header */
.header {
  background: linear-gradient(120deg, #4f46e5, #9333ea);
  color: #fff;
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-left img {
  height: 65px;
}
.header-right {
  text-align: right;
}
.invoice-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 6px;
}
.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.8rem;
  margin-top: 6px;
}
.status-Pending { background: #f59e0b; }
.status-Confirmed { background: #3b82f6; }
.status-Completed { background: #10b981; }
.status-Cancelled { background: #ef4444; }

/* Section */
.section {
  padding: 20px 32px;
  border-bottom: 1px solid #e5e7eb;
}
.section:last-child { border-bottom: none; }
.section h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: #374151;
}

/* Info Cards */
.info-cards {
  display: flex;
  gap: 20px;
}
.card {
  flex: 1;
  background: #f9fafb;
  border-radius: 10px;
  padding: 12px 16px;
  box-shadow: inset 0 0 4px rgba(0,0,0,0.04);
}
.card h4 {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 4px;
  color: #111827;
}
.card p {
  margin: 2px 0;
  font-size: 0.8rem;
  color: #374151;
}

/* Items Table */
.items-section table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}
.items-section th, .items-section td {
  padding: 10px;
  border-bottom: 1px solid #e5e7eb;
}
.items-section th {
  font-weight: 600;
  background: #f3f4f6;
  text-align: left;
}
.items-section td:last-child { text-align: right; }
.total-row {
  font-weight: 700;
  font-size: 0.9rem;
  background: #eef2ff;
}

/* Payment */
.payment-details p {
  margin: 3px 0;
  font-size: 0.85rem;
}

/* QR & Footer */
.qr {
  text-align: right;
  margin-top: 10px;
}
.footer {
  text-align: center;
  color: #6b7280;
  font-size: 0.75rem;
  padding: 16px;
  background: #f9fafb;
}
</style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="header-left">
        <img src="https://kayhanaudio.com.au/_next/image?url=%2Flogo.webp&w=128&q=75" alt="Logo" />
      </div>
      <div class="header-right">
        <div class="invoice-title">Invoice</div>
        <div class="status-badge status-${booking.status}">${
      booking.status
    }</div>
        <p><strong>#${booking.invoiceNumber}</strong></p>
        <p>${booking.date} ${booking.time}</p>
      </div>
    </div>

    <!-- Customer & Vehicle -->
    <div class="section">
      <div class="info-cards">
        <div class="card">
          <h4>Customer</h4>
          <p>${booking.User.firstname} ${booking.User.lastname}</p>
          <p>${booking.User.email}</p>
          <p>${booking.User.phone}</p>
          <p>${
            booking.MobileInstallationDetail?.dropoffAddress || "Store Pickup"
          }</p>
        </div>
        <div class="card">
          <h4>Vehicle</h4>
          <p>${booking.Vehicle.make} ${booking.Vehicle.model} (${
      booking.Vehicle.year
    })</p>
          <p>Registration Plate: ${booking.Vehicle.vinNumber}</p>
        </div>
      </div>
    </div>

    <!-- Items -->
    <div class="section items-section">
      <h3>Booking Items</h3>
      <table>
        <thead>
          <tr><th>Item</th><th>Charge</th></tr>
        </thead>
        <tbody>
          ${booking.BookingItems.map(
            (item: any) => `
            <tr>
              <td>${item.itemType}</td>
              <td>$${item.charge}</td>
            </tr>`
          ).join("")}
          <tr class="total-row">
            <td>Total</td>
            <td>$${total}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Payment -->
    <div class="section payment-details">
      <h3>Payment</h3>
      <p><strong>Category:</strong> ${booking.payment.category}</p>
      <p><strong>Method:</strong> ${booking.payment.methods.join(", ")}</p>
      <p><strong>Discount:</strong> $${booking.payment.discountAmount}</p>
      <p><strong>Total:</strong> $${booking.payment.totalAmount}</p>
      <p><strong>Paid:</strong> $${booking.payment.paidAmount}</p>
    </div>

    <!-- QR -->
    <div class="section qr">
      <img src="${qrDataUrl}" alt="QR Code" width="90"/>
    </div>

    <!-- Footer -->
    <div class="footer">
      Kayhan Audio - Unit 2/153 Dalgety Rd, Laverton North VIC 3026 | 
      support@kayhanaudio.com.au | 1300 696 488
    </div>
  </div>
</body>
</html>
`;

    await page.setContent(html, { waitUntil: "networkidle0" });

    await page.evaluate(() =>
      Promise.all(
        Array.from(document.images).map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((res) => {
                img.onload = res;
                img.onerror = res;
              })
        )
      )
    );

    const pdfDir = path.resolve(__dirname, "../../pdfs");
    if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

    const pdfFileName = `premium-invoice-${Date.now()}.pdf`;
    const pdfPath = path.join(pdfDir, pdfFileName);

    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", bottom: "12mm", left: "12mm", right: "12mm" },
    });

    const fileBuffer = fs.readFileSync(pdfPath);
    const fileUrl = await uploadToS3(
      fileBuffer,
      pdfFileName,
      "application/pdf"
    );
    const existingInvoice = await Invoice.findOne({
      where: { bookingId: booking.id },
    });

    if (existingInvoice) {
      await existingInvoice.update({
        userId: booking.userId || booking.User?.id,
        invoiceUrl: fileUrl,
        bookingStatus: booking.status,
      });
    } else {
      await Invoice.create({
        userId: booking.userId || booking.User?.id,
        bookingId: booking.id,
        invoiceUrl: fileUrl,
        bookingStatus: booking.status,
      });
    }

    fs.unlinkSync(pdfPath);
    return fileUrl;
  } catch (err) {
    console.error("❌ PDF generation error:", err);
    throw err;
  } finally {
    await browser.close();
  }
};
