import SubCategoriesList from "./SubCategoriesList";
import { headers } from "next/headers";

async function getData() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:5000/api";
  const h = await headers();
  const cookie = h.get("cookie") || "";

  try {
    const [scRes, catRes] = await Promise.all([
      fetch(`${apiUrl}/admin/subcategories`, { headers: { cookie }, cache: "no-store" }),
      fetch(`${apiUrl}/categories`, { cache: "no-store" }),
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
