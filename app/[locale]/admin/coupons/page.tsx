import CouponsList from "./CouponsList";
import { headers } from "next/headers";

async function getCoupons() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:5000/api";
  const h = await headers();
  const cookie = h.get("cookie") || "";

  try {
    const res = await fetch(`${apiUrl}/admin/coupons`, {
      headers: { cookie },
      cache: "no-store",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return [];
  }
}

export default async function AdminCouponsPage() {
  const coupons = await getCoupons();
  return <CouponsList initialCoupons={coupons} />;
}
