import app from "./src/app.js";
import dotenv from "dotenv";
import connectDB from "./src/config/database.js";
import { connectRedis } from "./src/config/redis.js";

dotenv.config(); // ✅ FIRST

// ✅ THEN connections
await connectDB();
await connectRedis();

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});