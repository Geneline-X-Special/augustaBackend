import { Router } from "express";
import { distributeFunds, transferFunds } from "../../controllers/interWalletTransaction/interWalletTransaction.js";
const transferRouter = Router()

transferRouter.post("/transfer", transferFunds)
transferRouter.post("/distribute", distributeFunds)

export default transferRouter