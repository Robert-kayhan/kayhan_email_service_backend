"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const client_ses_1 = require("@aws-sdk/client-ses");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Configure SES client (make sure region matches your AWS SES setup)
const ses = new client_ses_1.SESClient({
    region: "ap-southeast-2", // or "ap-southeast-2" as per your verified domain
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
const sendEmail = (_a) => __awaiter(void 0, [_a], void 0, function* ({ to, subject, bodyHtml, bodyText = "", from = "kayhanaudio@gmail.com", }) {
    console.log(process.env.AWS_ACCESS_KEY_ID);
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
    };
    try {
        const command = new client_ses_1.SendEmailCommand(params);
        const result = yield ses.send(command);
        console.log("✅ Email sent:", result.MessageId);
        return result;
    }
    catch (error) {
        console.error("❌ Error sending email:", error);
        throw error;
    }
});
exports.sendEmail = sendEmail;
