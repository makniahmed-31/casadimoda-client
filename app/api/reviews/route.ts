import db from "@/utils/db";
import Review from "@/models/Review";
import Product from "@/models/Product";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { NextResponse, NextRequest } from "next/server";

// GET /api/reviews?productId=xxx — fetch reviews for a product
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId)
    return NextResponse.json({ message: "productId required" }, { status: 400 });

  await db.connect();
  const reviews = await Review.find({ product: productId })
    .populate("user", "name")
    .sort({ createdAt: -1 })
    .lean();
  await db.disconnect();

  return NextResponse.json({ reviews: JSON.parse(JSON.stringify(reviews)) });
}

// POST /api/reviews — submit or update a rating
export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { productId, rating, comment } = await req.json();
  if (!productId || !rating || rating < 1 || rating > 5)
    return NextResponse.json({ message: "Invalid data" }, { status: 400 });

  await db.connect();

  const user = await User.findOne({ email: session.user.email }).select("_id");
  if (!user) {
    await db.disconnect();
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const product = await Product.findById(productId);
  if (!product) {
    await db.disconnect();
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  // Upsert review
  await Review.findOneAndUpdate(
    { user: user._id, product: productId },
    { user: user._id, product: productId, rating, comment },
    { upsert: true, new: true },
  );

  // Recalculate product rating
  const stats = await Review.aggregate([
    { $match: { product: product._id } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    product.rating = Math.round(stats[0].avg * 10) / 10;
    product.numReviews = stats[0].count;
    await product.save();
  }

  await db.disconnect();
  return NextResponse.json({
    rating: product.rating,
    numReviews: product.numReviews,
  });
}
