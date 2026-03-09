import Header from "@/components/Header";
import Footer from "@/components/Footer";
import db from "@/utils/db";
import ProductModel from "@/models/Product";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await db.connect();
  const docs = await ProductModel.find({}).lean();

  // Extract unique data
  const categories = Array.from(new Set(docs.map((p) => p.category)));
  const brands = Array.from(new Set(docs.map((p) => p.brand)));

  // Group subcategories by category
  const categoryMap = categories.reduce((acc, cat) => {
    acc[cat] = Array.from(
      new Set(
        docs
          .filter((p) => p.category === cat)
          .map((p) => p.subCategory)
          .filter(Boolean)
      )
    ) as string[];
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <>
      <Header
        categories={categories}
        brands={brands}
        categoryMap={categoryMap}
      />
      <main className="flex-grow ">{children}</main>
      <Footer />
    </>
  );
}
