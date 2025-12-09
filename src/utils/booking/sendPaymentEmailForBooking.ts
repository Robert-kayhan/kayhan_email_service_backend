// emailPaymentForBooking.ts
import { sendEmail } from "../sendEmail";
export const sendPaymentEmailForBooking = async ({
  customerEmail,
  customerName,
  bookingId,
  amount,
  paymentLink, // link where they can pay
}: {
  customerEmail: string;
  customerName: string;
  bookingId: string | number;
  amount: number;
  paymentLink: string;
}) => {
  // Subject
  const subject = `Payment Required for Booking #${bookingId}`;
  console.log(customerEmail, customerName, paymentLink)
  // Plain text version
  const bodyText = `
Hello ${customerName},

We’ve received your booking (ID: ${bookingId}).  
Amount due: $${amount}.  

Please complete your payment here: ${paymentLink}

Thank you!
`;

  // HTML version
  const bodyHtml = `
  <html>
    <body style="font-family:sans-serif;">
      <h2>Hello ${customerName},</h2>
      <p>We’ve received your booking <strong>#${bookingId}</strong>.</p>
      <p><strong>Amount Due: $${amount}</strong></p>
      <p>
        Please complete your payment using the link below:<br/>
        <a href="${paymentLink}" style="
          display:inline-block;
          background:#007BFF;
          color:#fff;
          padding:10px 16px;
          border-radius:4px;
          text-decoration:none;">
          Pay Now
        </a>
      </p>
      <p>Thank you for choosing us!</p>
    </body>
  </html>
  `;

  // Call your generic SES sender
  return sendEmail({
    to: customerEmail,
    subject,
    bodyHtml,
    bodyText,
    // from: "sales@mailer.kayhanaudio.com.au"
  });
};
