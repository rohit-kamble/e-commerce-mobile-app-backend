import express from "express";
// // import { isAuthenticated } from "../middlewares/auths.js";
// // import { singleUpload } from "../middlewares/multer.js";
import {
  addCategory,
  addProductImages,
  createProduct,
  deleteCategory,
  deleteProduct,
  deleteProductImages,
  getAllCategory,
  getAllProduct,
  getAllProductDetails,
  updateProduct,
  getAdminProduct,
} from "../controller/product.js";
import { isAuthenticated, isAdmin } from "../middlewares/auths.js";
import { singleUpload } from "../middlewares/multer.js";
const router = express.Router();

router.get("/all", getAllProduct);
router.get("/admin", isAuthenticated, isAdmin, getAdminProduct);

router
  .route("/single/:id")
  .get(getAllProductDetails)
  .put(isAuthenticated, isAdmin, updateProduct)
  .delete(isAuthenticated, isAdmin, deleteProduct);

router.post("/new", isAuthenticated, isAdmin, singleUpload, createProduct);

router
  .route("/images/:id")
  .post(isAuthenticated, isAdmin, singleUpload, addProductImages)
  .delete(isAuthenticated, isAdmin, deleteProductImages);

router.post("/category", isAuthenticated, isAdmin, addCategory);
router.get("/categories", getAllCategory);
router.delete("/category/:id", isAuthenticated, isAdmin, deleteCategory);

export default router;
