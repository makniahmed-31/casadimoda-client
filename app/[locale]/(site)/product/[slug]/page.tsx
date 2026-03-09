import { notFound } from "next/navigation";
import ProductDetailsContent from "@/components/ProductDetailsContent";
import db from "@/utils/db";
import Product from "@/models/Product";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductDetailsPage({ params }: ProductPageProps) {
  const { slug } = await params;

  await db.connect();
  const product = await Product.findOne({ slug }).lean();
  await db.disconnect();

  if (!product) {
    notFound();
  }

  const serializedProduct = JSON.parse(JSON.stringify(product));

  return <ProductDetailsContent product={serializedProduct} />;
}
