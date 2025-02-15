import { Router } from "express";
import { transferFunds } from "../../controllers/interWalletTransaction/interWalletTransaction.js";
const transferRouter = Router()

transferRouter.post("/", transferFunds)

export default transferRouter