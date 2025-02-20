import app from './app.js'
import connectDB from "./config/database.js";

const startServer = async () => {
  connectDB(app);
};


startServer();