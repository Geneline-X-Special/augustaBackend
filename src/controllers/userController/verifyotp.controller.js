import userModel from "../../models/User";
import generateUsersJwtAccessToken from "../../utils/signJwt";

export const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    const otpExist = await userModel.findOne({ otp }).exec();

    if (!otpExist) {
      return res
        .status(400)
        .json({ message: "Invalid OTP. Please try again with a valid OTP" });
    }

    await userModel.findOneAndUpdate(
      { otp },
      { PhoneVerified: true, otp: "" },
      { new: true }
    );
    const userId = otpExist.id;
    const token = generateUsersJwtAccessToken(userId);

    res.status(200).json({ message: "Phone Number Verified", token: token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message, statusCode: 500 });
  }
}