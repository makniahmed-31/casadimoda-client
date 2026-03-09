import { NextRequest, NextResponse } from "next/server";
import db from "@/utils/db";
import Product from "@/models/Product";
import Supplier from "@/models/Supplier";

export async function GET(req: NextRequest) {
  try {
    await db.connect();
    const { searchParams } = new URL(req.url);

    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const subCategory = searchParams.get("subCategory") || "";
    const brand = searchParams.get("brand") || "";
    const supplier = searchParams.get("supplier") || "";
    const price = searchParams.get("price") || "";
    const rating = searchParams.get("rating") || "";
    const sort = searchParams.get("sort") || "newest";
    const page = Number(searchParams.get("page")) || 1;
    const pageSize = Number(searchParams.get("pageSize")) || 12;

    const queryFilter =
      query && query !== "all"
        ? {
            name: {
              $regex: query,
              $options: "i",
            },
          }
        : {};

    const categoryFilter = category && category !== "all" ? { category } : {};
    const subCategoryFilter =
      subCategory && subCategory !== "all" ? { subCategory } : {};
    const brandFilter = brand && brand !== "all" ? { brand } : {};
    const supplierFilter =
      supplier && supplier !== "all" ? { supplier: supplier } : {};
    const ratingFilter =
      rating && rating !== "all"
        ? {
            rating: {
              $gte: Number(rating),
            },
          }
        : {};

    // Price filter handling: "min-max"
    const priceFilter =
      price && price !== "all"
        ? {
            price: {
              $gte: Number(price.split("-")[0]),
              $lte: Number(price.split("-")[1]),
            },
          }
        : {};

    // Only show approved products
    const approvalFilter = {
      $or: [
        { approvalStatus: "approved" },
        { approvalStatus: { $exists: false } },
        { addedBy: "admin" },
      ],
    };

    const order: Record<string, 1 | -1> =
      sort === "featured"
        ? { isFeatured: -1 }
        : sort === "lowest"
          ? { price: 1 }
          : sort === "highest"
            ? { price: -1 }
            : sort === "toprated"
              ? { rating: -1 }
              : sort === "newest"
                ? { createdAt: -1 }
                : { _id: -1 };

    const filter = {
      ...queryFilter,
      ...categoryFilter,
      ...subCategoryFilter,
      ...brandFilter,
      ...supplierFilter,
      ...priceFilter,
      ...ratingFilter,
      ...approvalFilter,
    };

    const categories = await Product.find(approvalFilter).distinct("category");
    const brands = await Product.find(approvalFilter).distinct("brand");
    const productDocs = await Product.find(filter)
      .populate("supplier", "businessName businessSlug")
      .sort(order)
      .skip(pageSize * (page - 1))
      .limit(pageSize)
      .lean();

    const countProducts = await Product.countDocuments(filter);

    await db.disconnect();

    return NextResponse.json({
      products: productDocs,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
      categories,
      brands,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Search failed", error },
      { status: 500 },
    );
  }
}
