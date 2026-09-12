import mongoose from 'mongoose';

/**
 * Connect to MongoDB with graceful non-blocking fallback
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/playnexus';

  try {
    mongoose.set('strictQuery', false);
    mongoose.set('bufferCommands', false); // Disable command buffering when disconnected
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[DATABASE] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[DATABASE] MongoDB connection unreached (${error.message}).`);
    console.warn(`[DATABASE] Running in MEMORY-FALLBACK mode. All rule-based AI APIs remain fully active!`);
    return null;
  }
};
