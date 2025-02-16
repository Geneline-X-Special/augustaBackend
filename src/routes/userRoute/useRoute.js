import express from "express";
import validator from "../../utils/Validators.js";
import bcrypt from "bcrypt";
import passwordModel from "../../models/password.js";
import userModel from "../../models/User.js";
import crypto from "crypto";
import requireAuthenticatedUser from "../../middlewares/auth.middleware.js";
import generateUsersJwtAccessToken from "../../utils/signJwt.js";
import { loginUser } from "../../controllers/userController/login.controller.js"
import { registerUser } from "../../controllers/userController/register.controller.js"
import { verifyOtp } from '../../controllers/userController/verifyotp.controller.js'
import { setup_password } from '../../controllers/userController/setupassword.controller.js'


const router = express.Router();
//USER ROUTES
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//sign up
router.post("/register", registerUser);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//verify otp
router.post("/verifyOTP", verifyOtp);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//setup password
router.post("/setup-password", requireAuthenticatedUser, setup_password);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//sign in
router.post("/login", validator.signinVlidator, loginUser);

export default router;
