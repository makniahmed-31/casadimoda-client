import SupplierProductsTable from "./ProductsTable";
import { API_URL } from "@/utils/api";

async function getData() {
  const [subCatsRes, catsRes, brandsRes] = await Promise.all([
    fetch(`${API_URL}/subcategories`, { cache: "no-store" }),
    fetch(`${API_URL}/categories`, { cache: "no-store" }),
    fetch(`${API_URL}/brands`, { cache: "no-store" }),
  ]);

  const subCategories = subCatsRes.ok ? await subCatsRes.json() : [];
  const categories = catsRes.ok ? await catsRes.json() : [];
  const brands = brandsRes.ok ? await brandsRes.json() : [];

  return {
    subCategories,
    categories,
    brands
  };
}

export default async function SupplierProductsPage() {
  const { subCategories, categories, brands } = await getData();

  return (
    <SupplierProductsTable
      categories={categories}
      subCategories={subCategories}
      brands={brands}
    />
  );
}
