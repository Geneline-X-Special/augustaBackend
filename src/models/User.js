import mongoose from "mongoose";

/**
 * @desc    User Schema - Defines the structure for storing user-related data
 * @model   User
 */
const userSchema = new mongoose.Schema(
  {
    /**
     * User's unique phone number (Required)
     * Ensures each user has a distinct phone number for authentication or communication.
     */
    phoneNumber: { type: String, unique: true, required: true },

    /**
     * User's first name (Required)
     */
    firstName: { type: String, required: true },

    /**
     * User's last name (Required)
     */
    lastName: { type: String, required: true },

    /**
     * Email address of the user (Required)
     */
    email: { type: String, required: true },

    /**
     * Date of birth (Required)
     * Stored as a Date type for easier calculations (e.g., age validation).
     */
    dateOfBirth: { type: Date, required: true },

    /**
     * User's residential address (Required)
     */
    address: { type: String, required: true },

    /**
     * National ID number (Required)
     * Used for verification or compliance purposes.
     */
    nationalId: { type: String, required: true },

    /**
     * OTP (One-Time Password) for email/phone verification
     * This field is used temporarily and should be cleared after verification.
     */
    otp: { type: String },

    /**
     * Indicates whether the user has verified their email/phone
     * Default: false (unverified until OTP verification)
     */
    isVerified: { type: Boolean, default: false },

    /**
     * Reference to the user's wallet (if applicable)
     * This links to another collection storing wallet details.
     */
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "wallet",
      default: null,  // Initially, users don't have a wallet until assigned
    }
  },
  {
    /**
     * Automatically adds `createdAt` and `updatedAt` timestamps
     * Helps track when the user was created or last modified.
     */
    timestamps: true,
  }
);

// Create and export the User model
const userModel = mongoose.model("user", userSchema);
export default userModel;
