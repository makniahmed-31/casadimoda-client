import db from "@/utils/db";
import Supplier from "@/models/Supplier";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { NextResponse, NextRequest } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await db.connect();

    const user = await User.findOne({ email: session.user.email });
    if (!user || !user.supplierId) {
      return NextResponse.json(
        { message: "Supplier profile not found" },
        { status: 404 },
      );
    }

    const supplier = await Supplier.findById(user.supplierId);
    if (!supplier) {
      return NextResponse.json(
        { message: "Supplier profile not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(supplier);
  } catch (error) {
    console.error("Error fetching supplier profile:", error);
    return NextResponse.json(
      { message: "Error fetching profile" },
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

    const body = await req.json();

    await db.connect();

    const user = await User.findOne({ email: session.user.email });
    if (!user || !user.supplierId) {
      return NextResponse.json(
        { message: "Supplier profile not found" },
        { status: 404 },
      );
    }

    // Only allow updating certain fields
    const allowedUpdates = {
      businessDescription: body.businessDescription,
      businessLogo: body.businessLogo,
      businessBanner: body.businessBanner,
      contactPhone: body.contactPhone,
      contactEmail: body.contactEmail,
    };

    // Remove undefined fields
    Object.keys(allowedUpdates).forEach((key) => {
      if (allowedUpdates[key as keyof typeof allowedUpdates] === undefined) {
        delete allowedUpdates[key as keyof typeof allowedUpdates];
      }
    });

    const supplier = await Supplier.findByIdAndUpdate(
      user.supplierId,
      allowedUpdates,
      { new: true },
    );

    return NextResponse.json(supplier);
  } catch (error) {
    console.error("Error updating supplier profile:", error);
    return NextResponse.json(
      { message: "Error updating profile" },
      { status: 500 },
    );
  }
}
