import db from "@/utils/db";
import Product from "@/models/Product";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  await db.connect();
  const totalProducts = await Product.countDocuments();
  const products = await Product.find({})
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

export async function POST(req: NextRequest) {
  const body = await req.json();
  await db.connect();
  const product = await Product.create(body);
  await db.disconnect();
  return NextResponse.json(product, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...updateData } = body;
  await db.connect();
  const product = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
  });
  await db.disconnect();
  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id)
    return NextResponse.json({ message: "ID required" }, { status: 400 });
  await db.connect();
  await Product.findByIdAndDelete(id);
  await db.disconnect();
  return NextResponse.json({ message: "Product deleted" });
}
