import SupplierProductsTable from "./ProductsTable";

async function getData() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:5000/api";
  
  const [subCatsRes, catsRes, brandsRes] = await Promise.all([
    fetch(`${apiUrl}/subcategories`, { cache: "no-store" }),
    fetch(`${apiUrl}/categories`, { cache: "no-store" }),
    fetch(`${apiUrl}/brands`, { cache: "no-store" }),
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
