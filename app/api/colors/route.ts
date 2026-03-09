import db from "@/utils/db";
import Color from "@/models/Color";
import { NextResponse } from "next/server";

// Public endpoint — used by product forms and display components
export async function GET() {
  await db.connect();
  const colors = await Color.find({}).sort({ name: 1 }).lean();
  return NextResponse.json(JSON.parse(JSON.stringify(colors)));
}
