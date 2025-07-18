import mongoose from "mongoose";

/**
 * Connects to MongoDB using Mongoose.
 * Uses environment variables for config.
 */

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGO_URI || "mongodb://localhost:27017/codeIDE";

    await mongoose.connect(mongoURI);

    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);

    mongoose.connection.on("error", (err) => {
      console.error("Mongoose connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("Mongoose disconnected");
    });
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
