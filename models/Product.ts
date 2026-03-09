import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    brand: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
    description: { type: String, required: true },
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    deliveryTime: { type: String },
    dimensions: { type: String },
    weight: { type: String },
    cbm: { type: Number },
    hsCode: { type: String },
    discountPrice: { type: Number, default: 0 },
    sizes: [{ type: String }],
    colors: [{ type: String }],
    colorImages: [
      {
        color: { type: String },
        hex: { type: String },
        image: { type: String },
      },
    ],
    parentCategory: {
      type: String,
      enum: ["detail", "gros"],
      default: "detail",
    },
    isFeatured: { type: Boolean, default: false },
    // Supplier/Vendor Reference
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },
    // Product Approval Status (for vendor-added products)
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },
    approvalNote: { type: String },
    // Track if product was added by admin or supplier
    addedBy: {
      type: String,
      enum: ["admin", "supplier"],
      default: "admin",
    },
  },
  {
    timestamps: true,
  },
);

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
