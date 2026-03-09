import db from "@/utils/db";
import Supplier from "@/models/Supplier";
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
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";

    // Build filter
    interface FilterType {
      status?: string;
      $or?: Array<{ [key: string]: { $regex: string; $options: string } }>;
    }

    const filter: FilterType = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { businessName: { $regex: search, $options: "i" } },
        { contactEmail: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Supplier.countDocuments(filter);
    const suppliers = await Supplier.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    return NextResponse.json({
      suppliers,
      totalPages: Math.ceil(total / pageSize),
      totalSuppliers: total,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json(
      { message: "Error fetching suppliers" },
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
    const { id, status, rejectionReason, commissionRate } = body;

    if (!id) {
      return NextResponse.json(
        { message: "Supplier ID required" },
        { status: 400 },
      );
    }

    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return NextResponse.json(
        { message: "Supplier not found" },
        { status: 404 },
      );
    }

    // Update supplier
    const updateData: {
      status?: string;
      rejectionReason?: string;
      approvedAt?: Date;
      approvedBy?: typeof adminUser._id;
      commissionRate?: number;
    } = {};

    if (status) {
      updateData.status = status;
      if (status === "approved") {
        updateData.approvedAt = new Date();
        updateData.approvedBy = adminUser._id;
        updateData.rejectionReason = "";
      } else if (status === "rejected") {
        updateData.rejectionReason = rejectionReason || "";
      }
    }

    if (commissionRate !== undefined) {
      updateData.commissionRate = commissionRate;
    }

    const updated = await Supplier.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("user", "name email");

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating supplier:", error);
    return NextResponse.json(
      { message: "Error updating supplier" },
      { status: 500 },
    );
  }
}
