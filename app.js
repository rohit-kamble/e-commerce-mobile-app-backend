import express from "express";
import dotenv from "dotenv";
import { errorMiddleWare } from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config({
  path: "./data/config.env",
});
export const app = express();
app.use(
  cors({
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    origin: [process.env.FRONtEND_URL_1, process.env.FRONtEND_URL_2],
  })
);
app.use(express.json());
app.use(cookieParser());
app.get("/", (req, res, next) => res.send("working"));
// importing routing here
import user from "./routes/user.js";
import product from "./routes/product.js";
import order from "./routes/order.js";

app.use("/api/v1/user", user);
app.use("/api/v1/product", product);
app.use("/api/v1/order", order);

// using Error middleware
app.use(errorMiddleWare);
