import mongoose from "mongoose";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not defined in .env file.");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      tls: true,
      tlsAllowInvalidCertificates: false,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("[MongoDB Connection Error]", error);
    process.exit(1);
  }
};

export default connectDB;
