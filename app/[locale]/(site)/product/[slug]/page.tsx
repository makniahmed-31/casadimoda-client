import { notFound } from "next/navigation";
import ProductDetailsContent from "@/components/ProductDetailsContent";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

import { API_URL } from "@/utils/api";

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${API_URL}/products?slug=${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export default async function ProductDetailsPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailsContent product={product} />;
}
