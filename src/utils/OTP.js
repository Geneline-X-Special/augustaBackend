import { randomBytes as _randomBytes } from "crypto";
import africastalking from 'africastalking';


// Initializing africastalking
const atClient = africastalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME,
});

const sms = atClient.SMS;

// Function to handle the generation of the OTP code
export const handleGeneratingOtp = () => {
  // Generate a random 3-byte (6-digit) hexadecimal number
  const randomBytes = _randomBytes(3);
  const randomHex = randomBytes.toString("hex");

  // Convert the hexadecimal number to decimal
  const randomDecimal = parseInt(randomHex, 16);

  // Ensure the number is six digits by taking the remainder when divided by 1,000,000
  const sixDigitNumber = randomDecimal % 1000000;

  // Ensure leading zeros are included if needed
  const formattedSixDigitNumber = String(sixDigitNumber).padStart(6, "0");

  return formattedSixDigitNumber;
};

// Function used to send the OTP code to the user
export const sendOtp = async (phoneNumber, otpCode) => {
  try {
    const response = await sms.send({
      to: [phoneNumber], // "+232XXXXXXXXX"
      message: `YouOTe is: ${otpCode}`, 
    });
    console.log('OTP sent: ', response);
    return { success: true, message: 'OTP sent successfully' }
  } catch (error) {
    console.error("Error sending OTP:", error);
    return { success: false, message: "Failed to send OTP." };
  }
}

