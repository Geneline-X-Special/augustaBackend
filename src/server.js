import app from './app.js'
import connectDB from "./config/database.js";
import transferRouter from './routes/interWalletTransaction/interWalletTransaction.js';

const app = express();

const PORT = process.env.PORT || 3600

connectDB(app);
app.use(express.json());

// //user plural for routes e.g (/users, /cards)
// app.use("/users", userRoute);
// app.use("/cards", requireAuthenticatedUser, cardRoute);
// app.use("/wallet", requireAuthenticatedUser, walletRoute);

// ///////////////// Mobile money /////////////////
app.use("/api/mobile-money", mobileMoneyRouter);

//////// Transfer Cash ///////
app.use("/api/wallet", transferRouter)

app.listen(PORT, () => {
  console.log(`server started on ${PORT}`)
})


