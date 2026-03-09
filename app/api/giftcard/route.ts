import db from "@/utils/db";
import GiftCard from "@/models/GiftCard";
import { NextRequest, NextResponse } from "next/server";

// POST /api/giftcard — validate a gift card code
export async function POST(req: NextRequest) {
  const { code } = await req.json();
  if (!code) return NextResponse.json({ message: "Code required" }, { status: 400 });

  await db.connect();
  const card = await GiftCard.findOne({ code: code.trim().toUpperCase(), isActive: true });
  await db.disconnect();

  if (!card) return NextResponse.json({ message: "Invalid or inactive gift card" }, { status: 404 });

  if (card.expiryDate && new Date(card.expiryDate) < new Date()) {
    return NextResponse.json({ message: "Gift card has expired" }, { status: 400 });
  }

  if (card.balance <= 0) {
    return NextResponse.json({ message: "Gift card has no remaining balance" }, { status: 400 });
  }

  return NextResponse.json({
    code: card.code,
    balance: card.balance,
  });
}
