import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
    // Role-based system
    role: {
      type: String,
      enum: ["customer", "supplier", "admin", "transporter"],
      default: "customer",
    },
    // Reference to supplier profile if user is a supplier
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },
    transporterCompanyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TransporterCompany",
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
