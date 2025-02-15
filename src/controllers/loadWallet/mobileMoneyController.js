import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';
import userModel from "../../models/User.js";
import Transaction from "../../models/transaction.js";
import Wallet from "../../models/wallet.js";
import dotenv from 'dotenv';
dotenv.config();

// Initiate a mobile money transaction using Monime
export const initiateTransaction = async (req, res) => {
  const { userId, amount } = req.body;

  // Validate required parameters
  if (!userId || !amount) {
    return res.status(400).json({ error: "Missing required parameters: userId and amount" });
  }

  // Retrieve the user from the database
  const dbUser = await userModel.findById(userId);
  if (!dbUser) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const idempotencyKey = uuidv4();
    const monimeSessionResponse = await fetch(process.env.MONIME_CHECKOUT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Monime-Space-Id': process.env.MONIME_SPACE_ID,
        'Authorization': `Bearer ${process.env.MONIME_ACCESS_TOKEN}`,
        'X-Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify({
        clientReference: userId,
        callbackUrlState: dbUser.id,
        bulk: {
          amount: {
            currency: "SLE",
            value: amount
          }
        },
        cancelUrl: `${process.env.OLTRA_PAY_REDIRECT_URL}/api/mobile-money/cancel?amount=${amount}`,
        receiptUrl: `${process.env.OLTRA_PAY_REDIRECT_URL}/api/mobile-money/receipt?amount=${amount}&monimeSessionId=${idempotencyKey}&userId=${dbUser.id}`
      })
    });

    const monimeSessionData = await monimeSessionResponse.json();
    console.log("Session data:", monimeSessionData);

    // Extract checkout URL from Monime response
    const monimeUrl = monimeSessionData.success ? monimeSessionData.result.checkoutUrl : null;
    if (!monimeUrl) {
      return res.status(500).json({ error: "Failed to create Monime session" });
    }

    return res.status(200).json({ url: monimeUrl });
  } catch (error) {
    console.error("Error initiating transaction:", error);
    return res.status(500).json({ error: "Failed to initiate transaction" });
  }
};

// Receipt callback endpoint – handles successful transactions
export const handleReceipt = async (req, res) => {
  // Expecting query parameters: amount, monimeSessionId, and userId
  const { amount, userId } = req.query;
  if (!userId || !amount) {
    return res.status(400).send("Missing required parameters");
  }

  try {
    // Retrieve the user to use their name for the wallet
    const dbUser = await userModel.findById(userId);
    if (!dbUser) {
      return res.status(404).send("User not found");
    }

    // Retrieve or create the user's wallet (each user should have only one wallet)
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      const walletName = `${dbUser.firstName} ${dbUser.lastName}'s Wallet`;
      wallet = new Wallet({
        userId,
        walletName,
        currency: "SLE",
        walletBalance: 0.0,
        walletStatus: true,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1-year expiry
      });
    }

    // Update wallet balance by adding the deposited amount
    const currentBalance = parseFloat(wallet.walletBalance.toString());
    const depositAmount = parseFloat(amount);
    wallet.walletBalance = currentBalance + depositAmount;
    await wallet.save();

    // Record the transaction
    const transaction = new Transaction({
      userId,
      walletId: wallet._id,
      amount: depositAmount,
      transactionType: "credit",
      description: "Mobile Money Load"
    });
    await transaction.save();

    return res.status(200).send("Transaction successful. Wallet updated.");
  } catch (error) {
    console.error("Error processing receipt callback:", error);
    return res.status(500).send("Internal server error");
  }
};

// Cancel callback endpoint – handles failed or cancelled transactions
export const handleCancel = async (req, res) => {
  // Optional: You may expect parameters such as monimeSessionId, amount, and userId
  const { monimeSessionId, userId, amount } = req.query;
  if (!userId) {
    return res.status(400).send("Missing required parameter: userId");
  }
  try {
    // Log the cancellation details; you could also record these in the database if needed
    console.log(`Transaction cancelled for user ${userId}. Session ID: ${monimeSessionId}, amount: ${amount}`);
    return res.status(200).send("Transaction cancelled/failed. No funds loaded.");
  } catch (error) {
    console.error("Error processing cancel callback:", error);
    return res.status(500).send("Internal server error");
  }
};
