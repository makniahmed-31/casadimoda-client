import BrandsList from "./BrandsList";
import { headers } from "next/headers";

async function getBrands() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:5000/api";
  const h = await headers();
  const cookie = h.get("cookie") || "";

  try {
    const res = await fetch(`${apiUrl}/admin/brands`, {
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
