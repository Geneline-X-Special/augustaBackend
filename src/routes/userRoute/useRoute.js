import express from "express";
import validator from "../../utils/Validators.js";
import { requireAuthenticatedUser } from "../../middlewares/auth.middleware.js";
import { loginUser } from "../../controllers/userController/login.controller.js";
import { registerUser } from "../../controllers/userController/register.controller.js";
import { verifyOtp } from "../../controllers/userController/verifyotp.controller.js";
import { setup_password } from "../../controllers/userController/setupassword.controller.js";

const router = express.Router(); // Initialize an Express router

// ============================== USER ROUTES ============================== //

/**
 * @route   POST /users/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", registerUser);

// ======================================================================== //

/**
 * @route   POST /users/verifyOTP
 * @desc    Verify the OTP sent to the user's email
 * @access  Public
 */
router.post("/verifyOTP", verifyOtp);

// ======================================================================== //

/**
 * @route   POST /setup-password
 * @desc    Set up a password after OTP verification
 * @access  Private (User must be authenticated)
 */
router.post("/setup-password", requireAuthenticatedUser, setup_password);

// ======================================================================== //

/**
 * @route   POST /users/login
 * @desc    Authenticate a user and generate a token
 * @access  Public
 */
router.post("/login", validator.signinVlidator, loginUser);

export default router;
