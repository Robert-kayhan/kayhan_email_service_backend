import { sendEmail } from "../sendEmail"; // adjust import path

export const sendInstallationConfirmationEmail = async ({
  customerName,
  customerEmail,
  installationDate,
  installationTime,
}: {
  customerName: string;
  customerEmail: string;
  installationDate: string;
  installationTime: string;
}) => {
  const subject = `Your Installation Booking is Confirmed – Kayhan Audio`;

  // ✅ HTML email body
  const bodyHtml = `
    <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.6;">
      <p>Hi <strong>${customerName}</strong>,</p>

      <p>Thank you for booking your installation with <strong>Kayhan Audio</strong>!<br/>
      Your installation has been <strong>successfully scheduled</strong> as per the details below:</p>

      <p>
        📅 <strong>Date:</strong> ${installationDate}<br/>
        ⏰ <strong>Time:</strong> ${installationTime}<br/>
        📍 <strong>Location:</strong> Unit 3, 151 Dohertys Rd, Laverton North, VIC 3026, Australia
      </p>

      <p>Our technician will be ready for your appointment at the scheduled time.<br/>
      Please make sure your vehicle is available and accessible for installation.</p>

      <p>If you need to <strong>reschedule or cancel</strong>, please contact us at:</p>

      <p>📞 1300 696 488<br/>
      ✉ <a href="mailto:support@kayhanaudio.com.au">support@kayhanaudio.com.au</a></p>

      <p>We look forward to upgrading your drive with Kayhan Audio!</p>

      <p>Best regards,<br/><br/>
      <strong>Kayhan Audio Team</strong><br/>
      🔧 <a href="https://www.kayhanaudio.com" target="_blank">www.kayhanaudio.com</a><br/>
      📍 Unit 3, 151 Dohertys Rd, Laverton North, VIC 3026, Australia<br/>
      📞 1300 696 488
      </p>
    </div>
  `;

  // Optional plain text version (for clients that don’t render HTML)
  const bodyText = `
Hi ${customerName},

Thank you for booking your installation with Kayhan Audio!
Your installation has been successfully scheduled.

Date: ${installationDate}
Time: ${installationTime}
Location: Unit 3, 151 Dohertys Rd, Laverton North, VIC 3026, Australia

If you need to reschedule or cancel, please contact:
1300 696 488 or support@kayhanaudio.com.au

Best regards,
Kayhan Audio Team
www.kayhanaudio.com
`;

  // ✅ Send the email using your SES function
  await sendEmail({
    to: customerEmail,
    subject,
    bodyHtml,
    bodyText,
    from : "info@mailer.kayhanaudio.com.au"
  });
};
