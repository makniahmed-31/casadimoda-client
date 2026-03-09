import ProductsTable from "./ProductsTable";
import { headers } from "next/headers";
import { API_URL } from "@/utils/api";

async function getData(searchQuery: string, page: number) {
  const h = await headers();
  const cookie = h.get("cookie") || "";

  const [productsRes, subCatsRes, catsRes, brandsRes] = await Promise.all([
    fetch(`${API_URL}/admin/products?q=${searchQuery}&page=${page}`, { headers: { cookie }, cache: "no-store" }),
    fetch(`${API_URL}/subcategories`, { cache: "no-store" }),
    fetch(`${API_URL}/categories`, { cache: "no-store" }),
    fetch(`${API_URL}/brands`, { cache: "no-store" }),
  ]);

  const productsData = productsRes.ok ? await productsRes.json() : { products: [], totalPages: 0 };
  const subCategories = subCatsRes.ok ? await subCatsRes.json() : [];
  const categories = catsRes.ok ? await catsRes.json() : [];
  const brands = brandsRes.ok ? await brandsRes.json() : [];

  return {
    products: productsData.products || [],
    totalPages: productsData.totalPages || 0,
    subCategories,
    categories,
    brands
  };
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const searchQuery = params.q || "";

  const { products, totalPages, subCategories, categories, brands } = await getData(searchQuery, page);

  return (
    <ProductsTable
      initialProducts={products}
      totalPages={totalPages}
      subCategories={subCategories}
      categories={categories}
      brands={brands}
    />
  );
}
