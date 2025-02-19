import pkg from 'mongoose';
const { connection } = pkg;
import { appPort, dbUrl } from "./default.config.js";
import mongoose from 'mongoose';


const connectionOptions = {
  autoIndex: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
};
const connectDB = async (app) => {
  try {
    if (app) {
      await mongoose.connect(process.env.MONGO_DB_URL, connectionOptions)
      console.log("✅ Connected to Database Successfully");
      app.listen(appPort, () => {
        console.log(`🚀 Server Listening `);
      });
    }
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);

    setTimeout(connectDB, 5000); // Retry connection every 5 seconds
  }

  connection.on("connected", () => {
    console.log("MongoDB connection established successfully.");
  });

  connection.on("error", (err) => {
    console.error(`MongoDB connection error: ${err}`);
  });

  connection.on("disconnected", () => {
    console.log("MongoDB connection disconnected.");
  });

  process.on("SIGINT", async () => {
    await connection.close();
    console.log("MongoDB connection closed due to application termination.");
    process.exit(0);
  });
};

export default connectDB;
