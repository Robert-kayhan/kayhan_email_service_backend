import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import dotenv from "dotenv";
dotenv.config();
// Configure SES client (make sure region matches your AWS SES setup)
const ses = new SESClient({
  region: "ap-southeast-2", // or "ap-southeast-2" as per your verified domain
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});


export const sendEmail = async ({
  to,
  subject,
  bodyHtml,
  bodyText = "",
  from = "kayhanaudio@gmail.com", 
}: {
  to: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  from?: string;
}) => {
  console.log(process.env.AWS_ACCESS_KEY_ID)
  const params = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: bodyHtml,
        },
        Text: {
          Charset: "UTF-8",
          Data: bodyText,
        },
      },
    },
    Source: from,
     ReplyToAddresses: ["support@kayhanaudio.com"],
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
