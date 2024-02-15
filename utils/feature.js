import DataUriPArser from "datauri/parser.js";
import path from "path";
import nodemailer from "nodemailer";

export const getDataUri = (file) => {
  const parser = new DataUriPArser();
  const exeName = path.extname(file.originalname).toString();
  return parser.format(exeName, file.buffer);
};

export const cookiesOptions = {
  secure: process.env.NODE_ENV === "Development" ? false : true,
  httpOnly: process.env.NODE_ENV === "Development" ? false : true,
  sameSite: process.env.NODE_ENV === "Development" ? false : "none",
};

export const sendToken = async (user, res, message, statusCode) => {
  const token = await user.generateToken();
  return res
    .status(statusCode)
    .cookie("token", token, {
      ...cookiesOptions,
      expire: new Date(Date.now() * 15 * 24 * 60 * 60 * 1000),
    })
    .json({
      success: true,
      message: message,
      token,
    });
};

export const sendEmail = async (subject, to, text) => {
  const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "c37902eb1544e1",
      pass: "126022f5314610",
    },
  });
  await transport.sendMail({
    to,
    subject,
    text,
  });
};
