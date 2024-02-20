import { asyncError } from "../middlewares/error.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/error.js";
import cloudinary from "cloudinary";
import { getDataUri } from "../utils/feature.js";
import { Category } from "../models/category.js";

export const getAllProduct = asyncError(async (req, res, next) => {
  const { keyword, category } = req.query;
  let products = [];
  if (keyword || category) {
    if (keyword) {
      products = await Product.find({
        name: {
          $regex: keyword ? keyword : "",
          $options: "i",
        },
      });
    } else if (category) {
      products = await Product.find({
        category: category ? category : undefined,
      });
    } else {
      products = await Product.find({
        name: {
          $regex: keyword ? keyword : "",
          $options: "i",
        },
        category: category ? category : undefined,
      });
    }
  } else {
    products = await Product.find();
  }

  res.status(200).json({
    success: true,
    products: products,
  });
});
export const getAdminProduct = asyncError(async (req, res, next) => {
  const products = await Product.find({}).populate("category");
  const outOfStock = products.filter((item) => item.stock === 0);
  res.status(200).json({
    success: true,
    products: products,
    outOfStock: outOfStock.length,
    isStock: products.length - outOfStock.length,
  });
});

export const getAllProductDetails = asyncError(async (req, res, next) => {
  const products = await Product.findById(req.params.id);
  if (!products) return next(new ErrorHandler("Product Not found", 400));

  res.status(200).json({
    success: true,
    products: products,
  });
});

export const createProduct = asyncError(async (req, res, next) => {
  const { name, description, category, price, stock } = req.body;

  //   await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  if (!req.file) return next(new ErrorHandler("Please add image", 400));
  const file = getDataUri(req.file);
  // Add Cloudanery here
  const myCloud = await cloudinary.v2.uploader.upload(file.content);
  const image = {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };

  await Product.create({
    name,
    category,
    description,
    stock,
    price,
    images: [image],
  });

  res.status(200).json({
    success: true,
    products: "Product create Successfully",
  });
});

export const updateProduct = asyncError(async (req, res, next) => {
  const { name, description, category, price, stock } = req.body;

  const products = await Product.findById(req.params.id);
  if (!products) return next(new ErrorHandler("Product Not found", 400));

  if (name) products.name = name;
  if (description) products.description = description;
  if (category) products.category = category;
  if (price) products.price = price;
  if (stock) products.stock = stock;
  console.log("product view", products, name);
  await products.save();
  res.status(200).json({
    success: true,
    products: "Product Updated Successfully",
  });
});

export const addProductImages = asyncError(async (req, res, next) => {
  //   const { name, description, category, price, stock } = req.body;

  //   await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  const products = await Product.findById(req.params.id);
  if (!products) return next(new ErrorHandler("Product Not found", 400));
  console.log("req.file", req.file, req.body);
  if (!req.file) return next(new ErrorHandler("Please add image", 400));
  const file = getDataUri(req.file);
  // Add Cloudanery here
  const myCloud = await cloudinary.v2.uploader.upload(file.content);
  const image = {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };

  products.images.push(image);
  products.save();

  res.status(200).json({
    success: true,
    products: "Product Added Successfully",
  });
});

export const deleteProductImages = asyncError(async (req, res, next) => {
  const id = req.query.id;
  const products = await Product.findById(req.params.id);
  if (!products) return next(new ErrorHandler("Product Not found", 400));
  if (!id) return next(new ErrorHandler("Please Images id", 400));
  let isExist = -1;
  products.images.forEach((item, index) => {
    if (item._id.toString() === id.toString()) isExist = index;
  });

  if (isExist < 0) return next(new ErrorHandler("image doesn't exist", 400));
  await cloudinary.v2.uploader.destroy(products.images[isExist].public_id);
  products.images.splice(isExist, 1);
  await products.save();

  res.status(200).json({
    success: true,
    products: "Image Deleted Successfully",
  });
});

export const deleteProduct = asyncError(async (req, res, next) => {
  const id = req.query.id;
  const products = await Product.findById(req.params.id);
  if (!products) return next(new ErrorHandler("Product Not found", 400));
  for (let i = 0; i < products.images.length; i++) {
    await cloudinary.v2.uploader.destroy(products.images[i].public_id);
  }

  await products.deleteOne();

  res.status(200).json({
    success: true,
    products: "Product Deleted Successfully",
  });
});

export const addCategory = asyncError(async (req, res, next) => {
  await Category.create(req.body);
  res.status(201).json({
    success: true,
    message: "Category Added Successfully",
  });
});
export const getAllCategory = asyncError(async (req, res, next) => {
  const categories = await Category.find({});
  res.status(200).json({
    success: true,
    categories,
  });
});
export const deleteCategory = asyncError(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new ErrorHandler("Category Not Found", 400));
  const products = await Product.find({ category: category._id });
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    product.category = undefined;
    await product.save();
  }
  await category.deleteOne();
  res.status(200).json({
    success: true,
    message: "Category Deleted Successfully",
  });
});
