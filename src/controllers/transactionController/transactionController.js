import Transaction from "../../models/transaction.js";
import userModel from '../../models/User.js';

// Get sender's transaction history (debits only)
export const getSenderTransactionHistory = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Debugging: Log userId
    console.log("User ID:", userId);

    // Fetch all debit transactions for the sender
    const transactions = await Transaction.find({ userId, transactionType: 'debit' }).exec();

    // Array to store formatted transaction history
    const transactionHistory = [];

    // Iterate through each transaction
    for (const transaction of transactions) {
      // Extract recipientId from the description
      const recipientId = transaction.description.match(/\(([^)]+)\)/)[1];

      // Fetch the recipient's details using _id
      const recipient = await userModel.findById(recipientId).exec();

      // Check if recipient exists
      if (!recipient) {
        console.error("Recipient not found for ID:", recipientId);
        continue; // Skip this transaction if recipient is not found
      }

      // Format the transaction history entry
      const historyEntry = {
        transactionId: transaction._id,
        amount: transaction.amount,
        transactionType: transaction.transactionType,
        description: transaction.description, // Use the description as stored in the transaction
        timestamp: transaction.timestamp,
        otherUser: {
          userId: recipient._id, // Use recipient._id instead of recipient.userId
          name: recipient.name,
          email: recipient.email,
        },
      };

      // Add the entry to the transaction history array
      transactionHistory.push(historyEntry);
    }

    // Send the response
    return res.status(200).json({ transactionHistory });
  } catch (error) {
    console.error('Error fetching sender transaction history:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

  // Get receiver's transaction history (credits only)
  export const getReceiverTransactionHistory = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Debugging: Log userId
        console.log("User ID:", userId);

        // Fetch all credit transactions for the receiver
        const transactions = await Transaction.find({ userId, transactionType: 'credit' }).exec();

        // Debugging: Log transactions
        console.log("Transactions:", transactions);

        // Array to store formatted transaction history
        const transactionHistory = [];

        // Iterate through each transaction
        for (const transaction of transactions) {
            // Extract senderId from the description using regex
            const senderIdMatch = transaction.description.match(/\(([^)]+)\)/);

            // Check if senderId was successfully extracted
            if (!senderIdMatch || senderIdMatch.length < 2) {
                console.error("Invalid description format for transaction:", transaction._id);
                continue; // Skip this transaction
            }

            const senderId = senderIdMatch[1];

            // Fetch the sender's details
            const sender = await userModel.findById(senderId).exec();

            // Debugging: Log sender
            console.log("Sender:", sender);

            // Check if sender exists
            if (!sender) {
                console.error("Sender not found for ID:", senderId);
                continue; // Skip this transaction if sender is not found
            }

            // Format the transaction history entry
            const historyEntry = {
                transactionId: transaction._id,
                amount: transaction.amount,
                transactionType: transaction.transactionType,
                description: transaction.description, // Use the description as stored in the transaction
                timestamp: transaction.createdAt, // Use createdAt instead of timestamp
                otherUser: {
                    userId: sender._id, // Use sender._id instead of sender.userId
                    name: sender.name,
                    email: sender.email,
                },
            };

            // Add the entry to the transaction history array
            transactionHistory.push(historyEntry);
        }

        // Debugging: Log transactionHistory
        console.log("Transaction History:", transactionHistory);

        // Send the response
        return res.status(200).json({ transactionHistory });
    } catch (error) {
        console.error('Error fetching receiver transaction history:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};