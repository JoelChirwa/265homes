import mongoose from "mongoose";

export async function connectDb() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    // DB is optional for current in-memory mode.
    return;
  }
  await mongoose.connect(mongoUri);
}
