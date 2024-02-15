import { app } from "./app.js";
import { connectDb } from "./data/database.js";
import cloudinary from "cloudinary";
import Stripe from "stripe";
connectDb();

export const stripe = new Stripe(process.env.STRIPE_API_SECRET);
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDONARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
app.listen(process.env.PORT, () => {
  console.log(
    `server is listing ${process.env.PORT} in ${process.env.NODE_ENV} mode`
  );
});
