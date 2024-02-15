import mongoose from "mongoose";
export const connectDb = async () => {
  try {
    const { connection } = await mongoose.connect(process.env.MONGO_URL, {
      dbName: "e-commerce-mobile-app",
    });
    console.log(`Server connected to database ${connection.host}`);
  } catch (err) {
    console.log("err", err);
    process.exit(1);
  }
};
