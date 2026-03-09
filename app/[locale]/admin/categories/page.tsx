import CategoriesList from "./CategoriesList";
import { headers } from "next/headers";

async function getCategories() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:5000/api";
  const h = await headers();
  const cookie = h.get("cookie") || "";

  try {
    const res = await fetch(`${apiUrl}/admin/categories`, {
      headers: { cookie },
      cache: "no-store",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return <CategoriesList initialCategories={categories} />;
}
