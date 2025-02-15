import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    phoneNumber: { type: String, unique: true, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    address: { type: String, required: true },
    nationalId: { type: String, required: true },
    otp: { type: String },
    password: { type: String, required: true }, // Store hashed password here
    phoneVerified: { type: Boolean, default: false },
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "wallet",
      default: null  // This will store the user's wallet reference
    }
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.model("user", userSchema);
export default userModel;
