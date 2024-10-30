"use strict";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendEmail = async (from, to, subject, text, html, reseURL) => {
  const transporter = nodemailer.createTransport({
    host: process.env.HOST,
    service: process.env.SERVICE,
    secureConnection: false,
    tls: {
      ciphers: "SSLv3",
    },
    port: 587,
    auth: {
      user: process.env.USER,
      pass: process.env.PASS,
    },
  });

  // async..await is not allowed in global scope, must use a wrapper

  // send mail with defined transport object
  const option = {
    from: from,
    to: to,
    subject: subject,
    text: text,
    html: html,
  };

  const info = transporter.sendMail(option, (error, info) => {
    if (error) {
      console.log(error);
      console.log("Email sent: " + info);
    }
  });
};

// import { MailtrapClient } from "mailtrap";
// import dotenv from "dotenv";

// dotenv.config();

// export const mailtrapClient = new MailtrapClient({
//   token: process.env.MAILTRAP_TOKEN2,
// });

// export const sender = {
//   email: "chichebewebdev@gmail.com",
//   name: "Chichebe",
// };
