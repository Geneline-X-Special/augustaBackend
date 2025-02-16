import passwordModel from "../../models/password.js";
import userModel from "../../models/User.js";
import bcrypt from "bcrypt";
import generateUsersJwtAccessToken from "../../utils/signJwt.js";


export const loginUser = async (req, res) => {
  const { phoneNumber, password } = req.body;

  const valid = validator.signinVlidator(phoneNumber, password);

  if (valid.error) {
    return res
      .status(400)
      .json({ statusCode: 400, error: valid.error.details[0].message });
  }
  
  try {
    const user = await userModel.findOne({ phoneNumber });

    if (!user) {
      return res
        .status(400)
        .json({ error: "Phone number or password is incorrect" });
    }
    const passWordValidation = await passwordModel.findOne({
      userId: user._id,
    });
    const isPasswordValid = await bcrypt.compare(
      password,
      passWordValidation.password
    );

    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ error: "Phone Number or Password is Invalid." });
    }
    // Step 4: Generate JWT token
    const token = generateUsersJwtAccessToken(user.id);

    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: error.message, statusCode: 500 });
  }
}