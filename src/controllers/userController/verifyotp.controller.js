import userModel from "../../models/User.js";
import generateUsersJwtAccessToken from "../../utils/signJwt.js";

/**
 * @desc    Verifies the OTP sent to the user and activates their account
 * @route   POST /users/verify-otp
 * @access  Public
 */
export const verifyOtp = async (req, res) => {
  try {
    // Extract OTP from request body
    const { otp } = req.body;

    // Check if OTP exists in the database
    const otpExist = await userModel.findOne({ otp }).exec();
    
    // If no matching OTP is found, return an error response
    if (!otpExist) {
      return res
        .status(400)
        .json({ message: "Invalid OTP. Please try again with a valid OTP" });
    }

    // Update user record: mark email as verified and remove OTP
    await userModel.findOneAndUpdate(
      { otp },
      { isVerified: true, otp: null }, // Set 'isVerified' to true and clear OTP field
      { new: true } // Return the updated document
    );

    // Generate a JWT access token for the user
    const userId = otpExist.id;
    const token = generateUsersJwtAccessToken(userId);

    // Respond with success message and token
    res.status(200).json({ message: "Email Verified", token: token });

  } catch (error) {
    console.error("OTP VERIFICATION ERROR: ", error); // Log the error for debugging
    res.status(500).json({ message: error.message, statusCode: 500 });
  }
};
