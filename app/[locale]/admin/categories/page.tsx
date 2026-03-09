import CategoriesList from "./CategoriesList";
import { headers } from "next/headers";
import { API_URL } from "@/utils/api";

async function getCategories() {
  const h = await headers();
  const cookie = h.get("cookie") || "";

  try {
    const res = await fetch(`${API_URL}/admin/categories`, {
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
