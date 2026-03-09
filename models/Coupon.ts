import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    discount: { type: Number, required: true }, // percentage or fixed amount
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    expiryDate: { type: Date },
    isActive: { type: Boolean, default: true },
    maxUsage: { type: Number, default: null }, // null = unlimited
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);
export default Coupon;
