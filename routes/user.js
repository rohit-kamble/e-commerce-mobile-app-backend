import express from "express";
import {
  login,
  signUp,
  getMyProfile,
  logOut,
  updateProfile,
  changedPassword,
  updatePic,
  resetPassword,
  forgotPassword,
} from "../controller/user.js";
import { isAuthenticated } from "../middlewares/auths.js";
import { singleUpload } from "../middlewares/multer.js";
const router = express.Router();

// Authenticate Routes
router.post("/login", login);
router.post("/signup", singleUpload, signUp);

// Profile Routes
router.get("/me", isAuthenticated, getMyProfile);
router.get("/logout", isAuthenticated, logOut);

// updating route
router.put("/update-profile", isAuthenticated, updateProfile);
router.put("/change-password", isAuthenticated, changedPassword);
router.put("/update-pic", isAuthenticated, singleUpload, updatePic);

//forgot password
router.route("/forgot-password").post(forgotPassword).put(resetPassword);
export default router;
