import db from "@/utils/db";
import Product from "@/models/Product";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await db.connect();

    // Verify admin
    const adminUser = await User.findOne({ email: session.user.email });
    if (!adminUser || !adminUser.isAdmin) {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const pageSize = 10;
    const skip = (page - 1) * pageSize;
    const status = searchParams.get("status") || "pending";

    // Get products that need approval (from suppliers)
    const filter = {
      addedBy: "supplier",
      approvalStatus: status,
    };

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate("supplier", "businessName businessSlug contactEmail")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    return NextResponse.json({
      products,
      totalPages: Math.ceil(total / pageSize),
      totalProducts: total,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching pending products:", error);
    return NextResponse.json(
      { message: "Error fetching products" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await db.connect();

    // Verify admin
    const adminUser = await User.findOne({ email: session.user.email });
    if (!adminUser || !adminUser.isAdmin) {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { id, status, approvalNote } = body;

    if (!id || !status) {
      return NextResponse.json(
        { message: "Product ID and status required" },
        { status: 400 },
      );
    }

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }

    const updateData = {
      approvalStatus: status,
      approvalNote: approvalNote || "",
    };

    const updated = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("supplier", "businessName businessSlug");

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating product approval:", error);
    return NextResponse.json(
      { message: "Error updating product" },
      { status: 500 },
    );
  }
}
