import { asyncError } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import { stripe } from "../server.js";
import ErrorHandler from "../utils/error.js";

export const processPayment = asyncError(async (req, res, next) => {
  const { totalAmount } = req.body;
  const { client_secret } = await stripe.paymentIntents.create({
    amount: Number(totalAmount * 100),
    currency: "inr",
  });
  res.status(200).json({
    success: true,
    client_secret,
  });
});
export const createOrder = asyncError(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentMethod,
    paymentInfo,
    itemsPrice,
    texPrice,
    shippingCharges,
    totalAmount,
  } = req.body;

  await Order.create({
    user: req.user._id,
    shippingInfo,
    orderItems,
    paymentMethod,
    paymentInfo,
    itemsPrice,
    texPrice,
    shippingCharges,
    totalAmount,
  });
  for (let i = 0; i < orderItems.length; i++) {
    const product = await Product.findById(orderItems[i].product);
    product.stock -= orderItems[i].quantity;
    await product.save();
  }
  res.status(201).json({
    success: true,
    message: "Order Placed Successfully",
  });
});

export const getMyOrder = asyncError(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    status: true,
    orders,
  });
});

export const getAdminOrder = asyncError(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });
  if (!orders) return next(new ErrorHandler("Order Not Found"));

  res.status(200).json({
    status: true,
    orders,
  });
});

export const getOrderDetails = asyncError(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });
  if (!orders) return next(new ErrorHandler("Order Not Found", 400));

  res.status(200).json({
    status: true,
    orders,
  });
});

export const processOrder = asyncError(async (req, res, next) => {
  const orders = await Order.findById(req.params.id);
  if (!orders) return next(new ErrorHandler("Order Not Found", 400));
  if (orders.orderStatus === "Preparing") orders.orderStatus = "Shipped";
  else if (orders.orderStatus === "Shipped") {
    orders.orderStatus = "Delivered";
    orders.deliveredAt = new Date(Date.now());
  } else return next(new ErrorHandler("Order Already Delivered", 400));

  await orders.save();

  res.status(200).json({
    status: true,
    message: "Order Processed SuccessFully",
  });
});
