import nodemailer from "nodemailer";
import "dotenv/config";

const { BASE_URL, MAIL_HOST, MAIL_USER, MAIL_PASSWORD } = process.env;

const nodemailerConfig = {
  host: MAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASSWORD,
  },
};

const transport = nodemailer.createTransport(nodemailerConfig);

const sendEmail = (email, verificationToken) => {
  const emailData = {
    from: MAIL_USER,
    to: email,
    subject: "Verify email",
    html: `<a href="${BASE_URL}/api/auth/verify/${verificationToken}" target="_blank">Click verify email</a>`,
  };
  return transport.sendMail(emailData);
};

export default sendEmail;
