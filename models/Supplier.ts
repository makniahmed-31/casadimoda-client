import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    // Link to User account
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Business Information
    businessName: { type: String, required: true },
    businessSlug: { type: String, required: true, unique: true },
    businessDescription: { type: String },
    businessLogo: { type: String },
    businessBanner: { type: String },

    // Contact Information
    contactPhone: { type: String, required: true },
    contactEmail: { type: String, required: true },

    // Address
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },

    // Business Documents (for verification)
    taxId: { type: String },
    businessLicense: { type: String },

    // Status & Approval
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
    approvedAt: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rejectionReason: { type: String },

    // Commission Settings (platform takes percentage)
    commissionRate: { type: Number, default: 15 },

    // Performance Metrics
    totalSales: { type: Number, default: 0 },
    totalProducts: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

const Supplier =
  mongoose.models.Supplier || mongoose.model("Supplier", supplierSchema);

export default Supplier;
