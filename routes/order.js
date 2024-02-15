import express from "express";
import {
  createOrder,
  getAdminOrder,
  getMyOrder,
  getOrderDetails,
  processOrder,
  processPayment,
} from "../controller/order.js";
import { isAdmin, isAuthenticated } from "../middlewares/auths.js";

const router = express.Router();

router.post("/new", isAuthenticated, createOrder);
router.get("/my", isAuthenticated, getMyOrder);
router.get("/admin", isAuthenticated, isAdmin, getAdminOrder);

router
  .route("/single/:id")
  .get(isAuthenticated, getOrderDetails)
  .put(isAuthenticated, isAdmin, processOrder);

router.post("/payment", isAuthenticated, processPayment);
export default router;
