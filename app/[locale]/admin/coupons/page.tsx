import CouponsList from "./CouponsList";
import { headers } from "next/headers";
import { API_URL } from "@/utils/api";

async function getCoupons() {
  const h = await headers();
  const cookie = h.get("cookie") || "";

  try {
    const res = await fetch(`${API_URL}/admin/coupons`, {
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
