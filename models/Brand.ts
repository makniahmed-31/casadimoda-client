import mongoose from "mongoose";

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  logo: { type: String },
  description: { type: String },
});

const Brand = mongoose.models.Brand || mongoose.model("Brand", brandSchema);
export default Brand;
