import nodemailer from "nodemailer";
import { randomBytes } from "crypto";
import dotenv from "dotenv";

dotenv.config();

/**
 * @function handleGeneratingOtp
 * @desc Generates a 6-digit One-Time Password (OTP) using random bytes.
 * @returns {string} - A 6-digit OTP as a string.
 */
export const handleGeneratingOtp = () => {
  // 🔹 Generate 3 random bytes
  const randomBytesValue = randomBytes(3);

  // 🔹 Convert the random bytes to a hexadecimal string
  const randomHex = randomBytesValue.toString("hex");

  // 🔹 Convert the hex string to a decimal number and take the last 6 digits
  const randomDecimal = parseInt(randomHex, 16) % 1000000;

  // 🔹 Ensure the OTP is exactly 6 digits (pad with leading zeros if necessary)
  return String(randomDecimal).padStart(6, "0");
};

/**
 * @function sendOtp
 * @desc Sends a One-Time Password (OTP) to a user's email using Nodemailer.
 * @param {string} email - The recipient's email address.
 * @param {string} otpCode - The OTP code to be sent.
 * @returns {boolean} - Returns `true` if email is sent successfully, otherwise `false`.
 */
export const sendOtp = async (email, otpCode) => {
  try {
    // 🔹 Create a transporter object using Gmail SMTP settings
    const transporter = nodemailer.createTransport({
      service: "gmail", // Using Gmail as the email service provider
      auth: {
        user: process.env.EMAIL_USER, // Email address (from .env)
        pass: process.env.EMAIL_PASS, // Email password or app-specific password (from .env)
      },
    });

    // 🔹 Email content configuration
    const mailOptions = {
      from: `Olta Pay <${process.env.EMAIL_USER}>`, // Sender's name and email
      to: email, // Recipient's email
      subject: "Olta Pay OTP Verification", // Email subject
      text: `Your OTP code is: ${otpCode}`, // Plain text version of the OTP
      html: `<p>Your OTP code is: <b>${otpCode}</b></p>`, // HTML version of the OTP
    };

    // 🔹 Send the email
    await transporter.sendMail(mailOptions);
    return true; // ✅ Email sent successfully
  } catch (error) {
    console.error("Error sending OTP:", error);
    return false; // ❌ Email sending failed
  }
};
