import db from "@/utils/db";
import Supplier from "@/models/Supplier";
import Product from "@/models/Product";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { NextResponse, NextRequest } from "next/server";
import slugify from "slugify";

// Helper to verify supplier and check if approved
async function getApprovedSupplier(email: string) {
  const user = await User.findOne({ email });
  if (!user || !user.supplierId) {
    return null;
  }

  const supplier = await Supplier.findById(user.supplierId);
  if (!supplier) {
    return null;
  }

  return supplier;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await db.connect();

    const supplier = await getApprovedSupplier(session.user.email);
    if (!supplier) {
      return NextResponse.json(
        { message: "Supplier profile not found" },
        { status: 404 },
      );
    }

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const pageSize = 10;
    const skip = (page - 1) * pageSize;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    // Build filter
    const filter: {
      supplier: typeof supplier._id;
      approvalStatus?: string;
      $or?: Array<{ [key: string]: { $regex: string; $options: string } }>;
    } = {
      supplier: supplier._id,
    };

    if (status && status !== "all") {
      filter.approvalStatus = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const totalProducts = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    return NextResponse.json({
      products,
      totalPages: Math.ceil(totalProducts / pageSize),
      totalProducts,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching supplier products:", error);
    return NextResponse.json(
      { message: "Error fetching products" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await db.connect();

    const supplier = await getApprovedSupplier(session.user.email);
    if (!supplier) {
      return NextResponse.json(
        { message: "Supplier profile not found" },
        { status: 404 },
      );
    }

    // Only approved suppliers can add products
    if (supplier.status !== "approved") {
      return NextResponse.json(
        {
          message:
            "Your supplier account must be approved before you can add products",
        },
        { status: 403 },
      );
    }

    const body = await req.json();

    // Generate slug if not provided
    let slug = body.slug;
    if (!slug) {
      slug = slugify(body.name, { lower: true, strict: true });
      // Ensure unique slug
      const existingProduct = await Product.findOne({ slug });
      if (existingProduct) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    // Create product with supplier reference and pending approval
    const product = await Product.create({
      name: body.name,
      slug,
      category: body.category,
      subCategory: body.subCategory,
      brand: body.brand,
      image: body.image,
      price: body.price,
      discountPrice: body.discountPrice || 0,
      countInStock: body.countInStock,
      description: body.description,
      deliveryTime: body.deliveryTime,
      dimensions: body.dimensions,
      weight: body.weight,
      cbm: body.cbm,
      hsCode: body.hsCode,
      sizes: body.sizes || [],
      colors: body.colors || [],
      colorImages: body.colorImages || [],
      isFeatured: false, // Suppliers cannot set featured
      supplier: supplier._id,
      approvalStatus: "pending", // Requires admin approval
      addedBy: "supplier",
    });

    // Update supplier's product count
    await Supplier.findByIdAndUpdate(supplier._id, {
      $inc: { totalProducts: 1 },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { message: "Error creating product" },
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

    const supplier = await getApprovedSupplier(session.user.email);
    if (!supplier) {
      return NextResponse.json(
        { message: "Supplier profile not found" },
        { status: 404 },
      );
    }

    if (supplier.status !== "approved") {
      return NextResponse.json(
        { message: "Your supplier account must be approved to edit products" },
        { status: 403 },
      );
    }

    const body = await req.json();

    // Verify product belongs to this supplier
    const existingProduct = await Product.findById(body._id || body.id);
    if (!existingProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }

    if (existingProduct.supplier?.toString() !== supplier._id.toString()) {
      return NextResponse.json(
        { message: "You do not have permission to edit this product" },
        { status: 403 },
      );
    }

    // Update product - reset approval status if key fields changed
    const needsReapproval =
      existingProduct.name !== body.name ||
      existingProduct.price !== body.price ||
      existingProduct.description !== body.description ||
      existingProduct.image !== body.image;

    const updateData = {
      name: body.name,
      slug: body.slug || existingProduct.slug,
      category: body.category,
      subCategory: body.subCategory,
      brand: body.brand,
      image: body.image,
      price: body.price,
      discountPrice: body.discountPrice || 0,
      countInStock: body.countInStock,
      description: body.description,
      deliveryTime: body.deliveryTime,
      dimensions: body.dimensions,
      weight: body.weight,
      cbm: body.cbm,
      hsCode: body.hsCode,
      sizes: body.sizes || [],
      colors: body.colors || [],
      colorImages: body.colorImages || [],
      // Reset approval if significant changes made
      ...(needsReapproval && { approvalStatus: "pending", approvalNote: "" }),
    };

    const product = await Product.findByIdAndUpdate(
      body._id || body.id,
      updateData,
      { new: true },
    );

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { message: "Error updating product" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("id");

    if (!productId) {
      return NextResponse.json(
        { message: "Product ID required" },
        { status: 400 },
      );
    }

    await db.connect();

    const supplier = await getApprovedSupplier(session.user.email);
    if (!supplier) {
      return NextResponse.json(
        { message: "Supplier profile not found" },
        { status: 404 },
      );
    }

    // Verify product belongs to this supplier
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }

    if (product.supplier?.toString() !== supplier._id.toString()) {
      return NextResponse.json(
        { message: "You do not have permission to delete this product" },
        { status: 403 },
      );
    }

    await Product.findByIdAndDelete(productId);

    // Update supplier's product count
    await Supplier.findByIdAndUpdate(supplier._id, {
      $inc: { totalProducts: -1 },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { message: "Error deleting product" },
      { status: 500 },
    );
  }
}
