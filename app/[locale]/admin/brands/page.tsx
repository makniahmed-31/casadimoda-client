import BrandsList from "./BrandsList";
import { headers } from "next/headers";
import { API_URL } from "@/utils/api";

async function getBrands() {
  const h = await headers();
  const cookie = h.get("cookie") || "";

  try {
    const res = await fetch(`${API_URL}/admin/brands`, {
      headers: { cookie },
      cache: "no-store",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Error fetching brands:", error);
    return [];
  }
}

export default async function AdminBrandsPage() {
  const brands = await getBrands();
  return <BrandsList initialBrands={brands} />;
}
