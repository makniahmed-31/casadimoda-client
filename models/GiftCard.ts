import mongoose from "mongoose";

const giftCardSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    balance: { type: Number, required: true },
    expiryDate: { type: Date },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const GiftCard =
  mongoose.models.GiftCard || mongoose.model("GiftCard", giftCardSchema);
export default GiftCard;
