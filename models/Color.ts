import mongoose from "mongoose";

const colorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    hex: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const Color = mongoose.models.Color || mongoose.model("Color", colorSchema);
export default Color;
