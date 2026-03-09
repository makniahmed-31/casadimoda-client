import Header from "@/components/Header";
import Footer from "@/components/Footer";

async function getNavigationData() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:5000/api";
  try {
    const res = await fetch(`${apiUrl}/navigation`, { cache: "no-store" });
    if (!res.ok) return { categories: [], brands: [], categoryMap: {} };
    return await res.json();
  } catch (error) {
    console.error("Error fetching navigation data:", error);
    return { categories: [], brands: [], categoryMap: {} };
  }
}

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { categories, brands, categoryMap } = await getNavigationData();

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
