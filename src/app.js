import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import userRoute from "./routes/userRoute/useRoute.js";
import cardRoute from "../src/routes/cardRoutes/cardsRoute.js";
import walletRoute from "../src/routes/walletRoute/walletRoute.js";
import { requireAuthenticatedUser } from "./middlewares/auth.middleware.js";
import mobileMoneyRouter from './routes/loadWallet/loadWallet.js';

const app = express();
app.use(express.json());
//user plural for routes e.g (/users, /cards)
app.use("/users", userRoute);
app.use("/cards", requireAuthenticatedUser, cardRoute);
app.use("/wallet", requireAuthenticatedUser, walletRoute);

///////////////// Mobile money /////////////////
app.use("/api/mobile-money", mobileMoneyRouter);

export default app;
