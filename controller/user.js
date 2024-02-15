import { User } from "../models/user.js";
import ErrorHandler from "../utils/error.js";
import { asyncError } from "../middlewares/error.js";
import {
  cookiesOptions,
  getDataUri,
  sendEmail,
  sendToken,
} from "../utils/feature.js";
import cloudinary from "cloudinary";
import { now } from "mongoose";

export const login = asyncError(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!password) {
    return next(new ErrorHandler("Please enter password", 400));
  }
  const isMatched = await user.comparePassword(password);

  if (!isMatched) {
    return next(new ErrorHandler("incorrect Email or password", 400));
  } else {
    sendToken(user, res, `Welcome ${user.name}`, 200);
  }
});
export const signUp = asyncError(async (req, res, next) => {
  const { name, email, password, address, city, country, pinCode } =
    await req.body;

  let user = await User.findOne({ email });
  if (user) {
    return next(new ErrorHandler("User Already Exist", 400));
  }
  let avatar = undefined;
  if (req?.file) {
    const file = getDataUri(req.file);

    // Add Cloudanery here
    const myCloud = await cloudinary.v2.uploader.upload(file.content);
    avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  user = await User.create({
    avatar,
    name,
    email,
    password,
    address,
    city,
    country,
    pinCode,
  });
  // res.setHeader('Content-Type', 'text/plain');
  // res.status(201).json({
  //   success: true,
  //   message: "Register Successfully",
  // });
  sendToken(user, res, "Register Successfully", 201);
});

export const logOut = asyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", "", {
      ...cookiesOptions,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Logged out Successfully",
    });
});

export const getMyProfile = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({
    success: true,
    user,
  });
});

export const updateProfile = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new ErrorHandler("incorrect Email or password", 400));
  }
  const { name, email, password, address, city, country, pinCode } =
    await req.body;
  if (user) user.name = name;
  if (email) user.email = email;
  if (password) user.password = password;
  if (address) user.address = address;
  if (city) user.city = city;
  if (country) user.country = country;
  if (pinCode) user.pinCode = pinCode;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Profile Update changed successfully",
  });
});

export const changedPassword = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return next(new ErrorHandler("incorrect oldPassword or newPassword", 400));
  }
  const isMatched = await user.comparePassword(oldPassword);
  if (!isMatched) return next(new ErrorHandler("Incorrect old Password"));
  user.password = newPassword;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

export const updatePic = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (req?.file) {
    const file = getDataUri(req.file);
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    // Add Cloudanery here
    const myCloud = await cloudinary.v2.uploader.upload(file.content);
    user.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }
  await user.save();
  res.status(200).json({
    success: true,
    message: "Avatar Update Successfully",
  });
});

export const forgotPassword = asyncError(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) return next(new ErrorHandler("Incorrect Email", 400));
  const randomNumber = Math.random() * (999999 - 100000) + 100000;
  const otp = Math.floor(randomNumber);
  console.log("==");
  const otp_expire = 15 * 60 * 1000;
  user.otp = otp;
  user.otp_expire = new Date(Date.now() + otp_expire);
  await user.save();
  const message = `Your OTP for  Resetting Password is ${otp}, \nplease ignore if you haven't requested this`;
  try {
    await sendEmail("otp for resetting password", user.email, message);
  } catch (err) {
    user.otp = null;
    user.otp_expire = null;
    await user.save();
    return next(new ErrorHandler(err, 400));
  }

  res.status(200).json({
    success: true,
    message: `Email Sent to ${user.email}`,
  });
});

export const resetPassword = asyncError(async (req, res, next) => {
  const { otp, password } = req.body;
  const user = await User.findOne({
    otp,
    otp_expire: {
      $gt: Date.now(),
    },
  });
  console.log("==user", user);
  if (!user)
    return next(new ErrorHandler("Incorrect Otp or has been expired", 400));
  if (!password)
    return next(new ErrorHandler("Please enter new Password", 400));

  user.password = password;
  user.otp = undefined;
  user.otp_expire = undefined;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Password Changed Successfully, you can login now",
  });
});
