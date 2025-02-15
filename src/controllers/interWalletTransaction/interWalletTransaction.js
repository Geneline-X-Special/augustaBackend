// controllers/transferController.js
import mongoose from 'mongoose';
import Wallet from '../../models/wallet.js';
import Transaction from '../../models/transaction.js';
import { oneToOneTransferSchema, oneToManyTransferSchema } from '../../utils/Validators.js';

// Transfer funds between users
export const transferFunds = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate request body
    const { senderId, recipientId, amount } = oneToOneTransferSchema.parse(req.body);

    // Retrieve sender's wallet
    const senderWallet = await Wallet.findOne({ userId: senderId }).session(session);
    if (!senderWallet) {
      return res.status(404).json({ error: 'Sender wallet not found' });
    }

    // Retrieve recipient's wallet
    const recipientWallet = await Wallet.findOne({ userId: recipientId }).session(session);
    if (!recipientWallet) {
      return res.status(404).json({ error: 'Recipient wallet not found' });
    }

    // Check if sender has sufficient balance
    if (senderWallet.walletBalance < amount) {
      return res.status(400).json({ error: 'Insufficient funds in sender\'s wallet' });
    }

    // Perform the transfer
    senderWallet.walletBalance -= amount;
    recipientWallet.walletBalance += amount;

    // Save the updated wallets
    await senderWallet.save({ session });
    await recipientWallet.save({ session });

    // Record the transaction for sender
    const senderTransaction = new Transaction({
      userId: senderId,
      walletId: senderWallet._id,
      amount,
      transactionType: 'debit',
      description: `Transfer to user ${recipientId}`,
    });

    // Record the transaction for recipient
    const recipientTransaction = new Transaction({
      userId: recipientId,
      walletId: recipientWallet._id,
      amount,
      transactionType: 'credit',
      description: `Transfer from user ${senderId}`,
    });

    // Save the transactions
    await senderTransaction.save({ session });
    await recipientTransaction.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ message: 'Transfer successful' });
  } catch (error) {
    // Abort the transaction in case of error
    await session.abortTransaction();
    session.endSession();

    if (error instanceof z.ZodError) {
      // Handle validation errors
      return res.status(400).json({ error: error.errors });
    }

    console.error('Error during fund transfer:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Distribute funds from one user to multiple users
export const distributeFunds = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate request body
    const { senderId, distributions } = oneToManyTransferSchema.parse(req.body);

    // Calculate total amount to be distributed
    const totalAmount = distributions.reduce((sum, dist) => sum + dist.amount, 0);

    // Retrieve sender's wallet
    const senderWallet = await Wallet.findOne({ userId: senderId }).session(session);
    if (!senderWallet) {
      return res.status(404).json({ error: 'Sender wallet not found' });
    }

    // Check if sender has sufficient balance
    if (senderWallet.walletBalance < totalAmount) {
      return res.status(400).json({ error: 'Insufficient funds in sender\'s wallet' });
    }

    // Deduct total amount from sender's wallet
    senderWallet.walletBalance -= totalAmount;
    await senderWallet.save({ session });

    // Iterate over distributions and credit each recipient
    for (const { recipientId, amount } of distributions) {
      // Retrieve recipient's wallet
      const recipientWallet = await Wallet.findOne({ userId: recipientId }).session(session);
      if (!recipientWallet) {
        throw new Error(`Recipient wallet not found for user ${recipientId}`);
      }

      // Update recipient's wallet balance
      recipientWallet.walletBalance += amount;
      await recipientWallet.save({ session });

      // Record the transaction for recipient
      const recipientTransaction = new Transaction({
        userId: recipientId,
        walletId: recipientWallet._id,
        amount,
        transactionType: 'credit',
        description: `Transfer from user ${senderId}`,
      });
      await recipientTransaction.save({ session });
    }

    // Record the transaction for sender
    const senderTransaction = new Transaction({
      userId: senderId,
      walletId: senderWallet._id,
      amount: totalAmount,
      transactionType: 'debit',
      description: 'Distributed funds to multiple users',
    });
    await senderTransaction.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ message: 'Distribution successful' });
  } catch (error) {
    // Abort the transaction in case of error
    await session.abortTransaction();
    session.endSession();

    if (error instanceof z.ZodError) {
      // Handle validation errors
      return res.status(400).json({ error: error.errors });
    }

    console.error('Error during fund distribution:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
