import bcrypt from "bcrypt";
import { handleGeneratingOtp, sendOtp } from "../../utils/OTP.js";
import validator from "../../utils/Validators.js";
import userModel from "../../models/User.js";
import passwordModel from "../../models/password.js"; // Import password model

/**
 * @function registerUser
 * @desc Handles user registration, including input validation, OTP generation, 
 *       password hashing, and storing user details in the database.
 * @route POST /users/register
 * @access Public
 */
export const registerUser = async (req, res) => {
  // Extract user input from request body
  const { firstName, lastName, email, dateOfBirth, address, nationalId, phoneNumber, password } = req.body;

  try {
    // 🔹 Validate user input using the custom validator
    const valid = validator.registerValidator(
      firstName,
      lastName,
      email,
      dateOfBirth,
      address,
      nationalId,
      phoneNumber,
      password
    );

    // 🔹 Return validation error response if validation fails
    if (valid.error) {
      return res.status(400).json({ 
        statusCode: 400, 
        error: valid.error.details[0].message 
      });
    }

    // 🔹 Check if the email already exists in the database
    const emailExists = await userModel.findOne({ email }).exec();
    if (emailExists) {
      return res.status(400).json({ message: "Email Already Exists." });
    }

    // 🔹 Generate a One-Time Password (OTP) for verification
    const otp = handleGeneratingOtp();
    
    // 🔹 Send the OTP to the user's email
    sendOtp(email, otp);

    // 🔹 Create a new user entry in the database (without password for security)
    const userCreated = await userModel.create({
      firstName,
      lastName,
      email,
      dateOfBirth,
      address,
      nationalId,
      phoneNumber,
      otp, // Store OTP temporarily for verification
    });

    // 🔹 Handle case where user creation fails
    if (!userCreated) {
      return res.status(500).json({ message: "User creation failed", statusCode: 500 });
    }

    // 🔹 Hash the user's password securely before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔹 Store the hashed password in the passwordModel (linked to user)
    await passwordModel.create({
      userId: userCreated._id, // Reference to the newly created user
      password: hashedPassword, // Store the hashed password securely
    });

    // 🔹 Return success response with OTP for verification
    return res.status(201).json({
      message: `User Account Created Successfully. Verify Account with the following OTP: ${otp}`,
    });
  } catch (error) {
    console.error("REGISTER USER ERROR: ", error.message || error);
    
    // 🔹 Handle unexpected server errors
    res.status(500).json({ 
      message: "Internal Server Error", 
      statusCode: 500 
    });
  }
};
