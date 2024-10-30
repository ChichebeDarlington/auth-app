import mongoose from "mongoose";

export const connectDatabase = async (URI) => {
  try {
    const connect = await mongoose.connect(URI);
    console.log(`MongoDB connected at ${connect.connection.host}`);
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  } finally {
    console.log("Db connected successfully");
  }
};
