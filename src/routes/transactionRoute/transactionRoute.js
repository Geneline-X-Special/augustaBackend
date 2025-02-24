import express from 'express';
import {
  getSenderTransactionHistory,
  getReceiverTransactionHistory,
} from '../../controllers/transactionController/transactionController.js';

const transactionRouter = express.Router();


transactionRouter.get('/sender/:userId', getSenderTransactionHistory);


transactionRouter.get('/receiver/:userId', getReceiverTransactionHistory);

export default transactionRouter;