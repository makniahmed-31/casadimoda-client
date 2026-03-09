import db from "@/utils/db";
import User from "@/models/User";
import Supplier from "@/models/Supplier";
import { getServerSession } from "next-auth/next";
import { NextResponse, NextRequest } from "next/server";
import slugify from "slugify";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      businessName,
      businessDescription,
      businessLogo,
      contactPhone,
      contactEmail,
      address,
      taxId,
      businessLicense,
    } = body;

    // Validate required fields
    if (
      !businessName ||
      !contactPhone ||
      !contactEmail ||
      !address?.street ||
      !address?.city ||
      !address?.postalCode ||
      !address?.country
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    await db.connect();

    // Find the user by email from session
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if user already has a supplier profile
    const existingSupplier = await Supplier.findOne({ user: user._id });
    if (existingSupplier) {
      return NextResponse.json(
        { message: "You already have a supplier account" },
        { status: 400 },
      );
    }

    // Check if user is already an admin
    if (user.isAdmin) {
      return NextResponse.json(
        { message: "Admin users cannot register as suppliers" },
        { status: 400 },
      );
    }

    // Generate unique slug
    let businessSlug = slugify(businessName, { lower: true, strict: true });
    const existingSlug = await Supplier.findOne({ businessSlug });
    if (existingSlug) {
      businessSlug = `${businessSlug}-${Date.now()}`;
    }

    // Create supplier profile
    const supplier = await Supplier.create({
      user: user._id,
      businessName,
      businessSlug,
      businessDescription: businessDescription || "",
      businessLogo: businessLogo || "",
      contactPhone,
      contactEmail,
      address: {
        street: address.street,
        city: address.city,
        postalCode: address.postalCode,
        country: address.country,
      },
      taxId: taxId || "",
      businessLicense: businessLicense || "",
      status: "pending",
    });

    // Update user role and link supplier
    await User.findByIdAndUpdate(user._id, {
      role: "supplier",
      supplierId: supplier._id,
    });

    return NextResponse.json(
      {
        message:
          "Supplier registration submitted successfully. Your application is pending approval.",
        supplierId: supplier._id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Supplier registration error:", error);
    return NextResponse.json(
      { message: "An error occurred during registration" },
      { status: 500 },
    );
  }
}
