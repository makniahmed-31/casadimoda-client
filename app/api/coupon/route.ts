import db from "@/utils/db";
import Coupon from "@/models/Coupon";
import { NextRequest, NextResponse } from "next/server";

// POST /api/coupon — validate a coupon code against a subtotal
export async function POST(req: NextRequest) {
  const { code, subtotal } = await req.json();
  if (!code) return NextResponse.json({ message: "Code required" }, { status: 400 });

  await db.connect();
  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase(), isActive: true });
  await db.disconnect();

  if (!coupon) return NextResponse.json({ message: "Invalid or inactive coupon" }, { status: 404 });

  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
    return NextResponse.json({ message: "Coupon has expired" }, { status: 400 });
  }

  if (coupon.maxUsage !== null && coupon.usageCount >= coupon.maxUsage) {
    return NextResponse.json({ message: "Coupon usage limit reached" }, { status: 400 });
  }

  const discount =
    coupon.type === "percentage"
      ? Math.round((subtotal * coupon.discount) / 100)
      : coupon.discount;

  return NextResponse.json({
    code: coupon.code,
    type: coupon.type,
    discount: coupon.discount,
    discountAmount: Math.min(discount, subtotal),
  });
}
