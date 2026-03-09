import mongoose from "mongoose";

const transporterCompanySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    companyName: { type: String, required: true },
    companySlug: { type: String, required: true, unique: true },
    description: { type: String },
    logo: { type: String },
    phone: { type: String, required: true },
    contactEmail: { type: String, required: true },
    website: { type: String },
    trackingUrl: { type: String },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    coverageAreas: [{ type: String }],
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

const TransporterCompany =
  mongoose.models.TransporterCompany ||
  mongoose.model("TransporterCompany", transporterCompanySchema);

export default TransporterCompany;
