import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    walletName: { type: String, required: true },
    currency: { type: String, required: true },
    walletBalance: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      default: 0.0,
    },
    walletStatus: { type: Boolean, required: true, default: true },
    expiryDate: { type: Date, required: false, default: null },
  },
  {
    timestamps: true,
  }
);

const Wallet = mongoose.model("Wallet", walletSchema);
export default Wallet;
