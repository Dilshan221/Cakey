import mongoose from "mongoose";

let connectionPromise;

export async function connectDatabase() {
  if (mongoose.connection.readyState === 1) return mongoose;

  if (!connectionPromise) {
    const uri = process.env.MONGO_URI ||
      (process.env.NODE_ENV !== "production" && !process.env.VERCEL
        ? "mongodb://127.0.0.1:27017/cake_bake_dev"
        : null);

    if (!uri) throw new Error("MONGO_URI is required in production");

    // Share concurrent cold-start requests and reuse the pool on warm requests.
    connectionPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    }).catch((error) => {
      connectionPromise = undefined;
      throw error;
    });
  }

  await connectionPromise;
  if (mongoose.connection.readyState !== 1) {
    connectionPromise = undefined;
    throw new Error("MongoDB connection was lost");
  }
  return mongoose;
}
