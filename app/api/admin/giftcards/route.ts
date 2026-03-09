import db from "@/utils/db";
import GiftCard from "@/models/GiftCard";
import { NextResponse, NextRequest } from "next/server";

export async function GET() {
  await db.connect();
  const giftCards = await GiftCard.find({});
  await db.disconnect();
  return NextResponse.json(giftCards);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  await db.connect();
  const giftCard = await GiftCard.create(body);
  await db.disconnect();
  return NextResponse.json(giftCard, { status: 201 });
}
