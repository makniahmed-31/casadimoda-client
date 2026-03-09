import db from "@/utils/db";
import Color from "@/models/Color";
import { NextResponse, NextRequest } from "next/server";

export async function GET() {
  await db.connect();
  const colors = await Color.find({}).sort({ name: 1 }).lean();
  return NextResponse.json(JSON.parse(JSON.stringify(colors)));
}

export async function POST(req: NextRequest) {
  const { name, hex } = await req.json();
  if (!name || !hex) {
    return NextResponse.json({ message: "name and hex are required" }, { status: 400 });
  }
  await db.connect();
  const color = await Color.create({ name: name.trim(), hex: hex.trim() });
  return NextResponse.json(JSON.parse(JSON.stringify(color)), { status: 201 });
}

export async function PUT(req: NextRequest) {
  const { id, name, hex } = await req.json();
  if (!id) return NextResponse.json({ message: "id required" }, { status: 400 });
  await db.connect();
  const color = await Color.findByIdAndUpdate(id, { name: name?.trim(), hex: hex?.trim() }, { new: true });
  return NextResponse.json(JSON.parse(JSON.stringify(color)));
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ message: "id required" }, { status: 400 });
  await db.connect();
  await Color.findByIdAndDelete(id);
  return NextResponse.json({ message: "Color deleted" });
}
