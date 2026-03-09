import SubCategoriesList from "./SubCategoriesList";
import { headers } from "next/headers";
import { API_URL } from "@/utils/api";

async function getData() {
  const h = await headers();
  const cookie = h.get("cookie") || "";

  try {
    const [scRes, catRes] = await Promise.all([
      fetch(`${API_URL}/admin/subcategories`, { headers: { cookie }, cache: "no-store" }),
      fetch(`${API_URL}/categories`, { cache: "no-store" }),
    ]);

    const subCategories = scRes.ok ? await scRes.json() : [];
    const categories = catRes.ok ? await catRes.json() : [];

    return { subCategories, categories };
  } catch (error) {
    console.error("Error fetching subcategories data:", error);
    return { subCategories: [], categories: [] };
  }
}

export default async function AdminSubcategoriesPage() {
  const { subCategories, categories } = await getData();

  return (
    <SubCategoriesList
      initialSubCategories={subCategories}
      categories={categories}
    />
  );
}
