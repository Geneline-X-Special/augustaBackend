import { handleGeneratingOtp, sendOtp } from "../../utils/OTP.js";
import validator from "../../utils/Validators.js";
import userModel from "../../models/User.js";


export const registerUser = async (req, res) => {
  try {
    let { firstName, lastName, dateOfBirth, address, nationalId, phoneNumber } =
      req.body;
    const valid = validator.registerValidator(
      firstName,
      lastName,
      dateOfBirth,
      address,
      nationalId,
      phoneNumber
    );
    if (valid.error) {
      return res
        .status(400)
        .json({ statusCode: 400, error: valid.error.details[0].message });
    }
    const phoneNumberExists = await userModel.findOne({ phoneNumber }).exec();
    if (phoneNumberExists) {
      return res.status(400).json({ message: "Phone Number Already Exist." });
    }
    const otp = handleGeneratingOtp();
    sendOtp(phoneNumber, otp);
    const userCreated = await userModel
      .create({
        firstName,
        lastName,
        dateOfBirth,
        address,
        nationalId,
        phoneNumber,
        otp,
      })
      .catch((error) => {
        console.error("REGISTER USER ERROR: ", error);
        throw error;
      });

    if (userCreated) {
      return res.status(201).json({
        message: `User Accout Created Successfully. Verify Account with the following OTP: ${otp}`,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, statusCode: 500 });
  }
}