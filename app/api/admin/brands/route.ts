import db from "@/utils/db";
import Brand from "@/models/Brand";
import { NextResponse, NextRequest } from "next/server";

export async function GET() {
  await db.connect();
  const brands = await Brand.find({});
  await db.disconnect();
  return NextResponse.json(brands);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  await db.connect();
  const brand = await Brand.create(body);
  await db.disconnect();
  return NextResponse.json(brand, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id)
    return NextResponse.json({ message: "ID required" }, { status: 400 });
  await db.connect();
  await Brand.findByIdAndDelete(id);
  await db.disconnect();
  return NextResponse.json({ message: "Brand deleted" });
}
