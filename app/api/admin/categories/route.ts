import db from "@/utils/db";
import Category from "@/models/Category";
import { NextResponse, NextRequest } from "next/server";

export async function GET() {
  await db.connect();
  const categories = await Category.find({});
  await db.disconnect();
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  await db.connect();
  const category = await Category.create(body);
  await db.disconnect();
  return NextResponse.json(category, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });
  await db.connect();
  await Category.findByIdAndDelete(id);
  await db.disconnect();
  return NextResponse.json({ message: "Category deleted" });
}
