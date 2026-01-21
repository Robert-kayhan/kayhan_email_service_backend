import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import dotenv from "dotenv";
import dns from "dns";

dotenv.config();

// Force Node.js to use IPv4 first
dns.setDefaultResultOrder("ipv4first");

import { NodeHttpHandler } from "@aws-sdk/node-http-handler";
``
const ses = new SESClient({
  region: "ap-southeast-2",
  endpoint: "https://email.ap-southeast-2.amazonaws.com",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  requestHandler: new NodeHttpHandler({
    connectionTimeout: 15000, // 15 seconds
    socketTimeout: 15000,
  }),
});


export const sendEmail = async ({
  to,
  subject,
  bodyHtml,
  bodyText = "",
  from = "newsletter@mailer.kayhanaudio.com.au",
}: {
  to: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  from?: string;
}) => {
  const replyAdress = from == "wholesales@mailer.kayhanaudio.com.au" ? "wholesales@kayhanaudio.com.au" : "info@kayhanaudio.com.au"
  const params = {
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Charset: "UTF-8", Data: subject },
      Body: {
        Html: { Charset: "UTF-8", Data: bodyHtml },
        Text: { Charset: "UTF-8", Data: bodyText },
      },
    },
    Source: from,
    ReplyToAddresses: [replyAdress],
  };

  try {
    const command = new SendEmailCommand(params);
    const result = await ses.send(command);
    console.log("✅ Email sent:", result.MessageId);
    return result;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};
