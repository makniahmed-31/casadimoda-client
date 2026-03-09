import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  image: { type: String },
});

const Category =
  mongoose.models.Category || mongoose.model("Category", categorySchema);
export default Category;
