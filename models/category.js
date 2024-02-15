import mongoose, { Schema } from "mongoose";
const schema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, "Please Enter Category"],
  },
});

export const Category = mongoose.model("Category", schema);
