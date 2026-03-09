import db from "@/utils/db";
import Product from "@/models/Product";
import Supplier from "@/models/Supplier";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 12;
  const skip = (page - 1) * pageSize;

  await db.connect();

  // Only show approved products (admin products are auto-approved, supplier products need approval)
  const filter = {
    $or: [
      { approvalStatus: "approved" },
      { approvalStatus: { $exists: false } }, // Legacy products without status
      { addedBy: "admin" }, // Admin products are always shown
    ],
  };

  const totalProducts = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .populate("supplier", "businessName businessSlug")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize);

  await db.disconnect();

  return NextResponse.json({
    products,
    totalPages: Math.ceil(totalProducts / pageSize),
    totalProducts,
  });
}
