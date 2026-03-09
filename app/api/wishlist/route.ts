import db from "@/utils/db";
import Wishlist from "@/models/Wishlist";
import User from "@/models/User";
import Product from "@/models/Product";
import { getServerSession } from "next-auth/next";
import { NextResponse, NextRequest } from "next/server";

// GET /api/wishlist?productId=xxx — check if product is wishlisted
// GET /api/wishlist — get all wishlist items for current user
export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await db.connect();
  const user = await User.findOne({ email: session.user.email }).select("_id");
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  if (productId) {
    const item = await Wishlist.findOne({ user: user._id, product: productId });
    return NextResponse.json({ isWishlisted: !!item });
  }

  const items = await Wishlist.find({ user: user._id })
    .populate("product", "name slug image price discountPrice brand")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ items: JSON.parse(JSON.stringify(items)) });
}

// POST /api/wishlist — add product to wishlist
export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await req.json();
  if (!productId) {
    return NextResponse.json({ message: "productId required" }, { status: 400 });
  }

  await db.connect();
  const user = await User.findOne({ email: session.user.email }).select("_id");
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const product = await Product.findById(productId).select("_id");
  if (!product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  await Wishlist.findOneAndUpdate(
    { user: user._id, product: productId },
    { user: user._id, product: productId },
    { upsert: true }
  );

  return NextResponse.json({ isWishlisted: true });
}

// DELETE /api/wishlist — remove product from wishlist
export async function DELETE(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await req.json();
  if (!productId) {
    return NextResponse.json({ message: "productId required" }, { status: 400 });
  }

  await db.connect();
  const user = await User.findOne({ email: session.user.email }).select("_id");
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  await Wishlist.deleteOne({ user: user._id, product: productId });

  return NextResponse.json({ isWishlisted: false });
}
