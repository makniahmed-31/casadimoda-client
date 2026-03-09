import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    parentCategory: { type: String, required: true },
    description: { type: String },
    image: { type: String },
});

const SubCategory =
    mongoose.models.SubCategory || mongoose.model("SubCategory", subCategorySchema);
export default SubCategory;
