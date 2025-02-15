// routes/mobileMoneyRoutes.js
import { Router } from "express";

import { initiateTransaction, handleReceipt, handleCancel } from "../../controllers/loadWallet/mobileMoneyController.js";
const mobileMoneyRouter = Router();

// Route to initiate the mobile money transaction
mobileMoneyRouter.post('/initiate', initiateTransaction);

// Callback endpoint for a successful transaction
mobileMoneyRouter.post('/receipt', handleReceipt);

// Callback endpoint for a failed/cancelled transaction
mobileMoneyRouter.post('/cancel', handleCancel);

export default mobileMoneyRouter;
