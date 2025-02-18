import passwordModel from "../../models/password.js";
import userModel from "../../models/User.js";
import bcrypt from "bcrypt";
import generateUsersJwtAccessToken from "../../utils/signJwt.js";

/**
 * @desc   Logs in a user by verifying credentials and generating a JWT token.
 * @route  POST /users/login
 * @access Public
 */
export const loginUser = async (req, res) => {
  // Extract email and password from request body
  const { email, password } = req.body;
  
  try {
    /**
     * Step 1: Check if the user exists in the database
     */
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "Email or password is incorrect" });
    }

    /**
     * Step 2: Ensure the user's email is verified before allowing login
     */
    if (!user.isVerified) {
      return res.status(403).json({ message: "Email not verified. Please verify your email." });
    }

    /**
     * Step 3: Retrieve the hashed password from the password model
     */
    const passWordValidation = await passwordModel.findOne({ userId: user._id });

    if (!passWordValidation) {
      return res.status(400).json({ error: "Password record not found for user" });
    }

    /**
     * Step 4: Compare the provided password with the stored hashed password
     */
    const isPasswordValid = await bcrypt.compare(password, passWordValidation.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Email or Password is Invalid." });
    }

    /**
     * Step 5: Generate a JWT token for the authenticated user
     */
    const token = generateUsersJwtAccessToken(user.id);

    /**
     * Step 6: Return the success response with the JWT token
     */
    res.json({ message: "Login successful", token });

  } catch (error) {
    /**
     * Step 7: Handle server errors
     */
    res.status(500).json({ message: error.message, statusCode: 500 });
  }
};
