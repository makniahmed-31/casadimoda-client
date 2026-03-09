import ProductItem from "@/components/ProductItem";
import { Product } from "@/types";
import SearchSidebar from "./SearchSidebar";
import { Link } from "@/i18n/routing";
import { X } from "lucide-react";
import db, { MongoDocument } from "@/utils/db";
import ProductModel from "@/models/Product";
import SortSelect from "@/components/SortSelect";
import { useTranslations } from "next-intl";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    subCategory?: string;
    brand?: string;
    price?: string;
    rating?: string;
    sort?: string;
    page?: string;
  }>;
}

function SearchContent({
  products,
  countProducts,
  categories,
  brands,
  q,
  category,
  subCategory,
  brand,
  price,
  rating,
  sort,
  page,
  pages,
  getFilterUrl,
}: {
  products: Product[];
  countProducts: number;
  categories: string[];
  brands: string[];
  q: string;
  category: string;
  subCategory: string;
  brand: string;
  price: string;
  rating: string;
  sort: string;
  page: string;
  pages: number;
  getFilterUrl: (key: string, value: string) => string;
}) {
  const t = useTranslations("search");

  return (
    <div className="bg-[#2a2a2a] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col-reverse lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-1/4 flex-shrink-0">
            <SearchSidebar
              categories={categories}
              brands={brands}
              category={category}
              brand={brand}
              price={price}
              rating={rating}
              sort={sort}
            />
          </div>

          {/* Main Content */}
          <div className="w-full lg:w-3/4">
            <div className="mb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-[#363636] border border-white/[0.08] p-4">
              <div>
                <h1 className="text-base md:text-lg font-bold text-white">
                  {q !== "all"
                    ? t("resultsFor", { query: q })
                    : t("allCollections")}
                </h1>
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-0.5">
                  {countProducts} {t("product")}{countProducts !== 1 ? "s" : ""} {countProducts !== 1 ? t("foundPlural") : t("found")}
                </p>
              </div>

              <SortSelect currentSort={sort} />
            </div>

            {/* Active Filters Display */}
            {(category !== "all" ||
              brand !== "all" ||
              price !== "all" ||
              rating !== "all" ||
              (q !== "all" && q !== "")) && (
              <div className="flex flex-wrap gap-2 mb-5">
                {q !== "all" && q !== "" && (
                  <Link
                    href={getFilterUrl("q", "all")}
                    className="bg-accent/20 text-accent text-[9px] font-bold uppercase tracking-widest px-3 py-1 flex items-center gap-1 hover:bg-accent/30 transition-colors"
                  >
                    « {q} » <X size={10} />
                  </Link>
                )}
                {category !== "all" && (
                  <Link
                    href={getFilterUrl("category", "all")}
                    className="bg-white/10 text-white/60 text-[9px] font-bold uppercase tracking-widest px-3 py-1 flex items-center gap-1 hover:bg-white/20 transition-colors"
                  >
                    {category} <X size={10} />
                  </Link>
                )}
                {brand !== "all" && (
                  <Link
                    href={getFilterUrl("brand", "all")}
                    className="bg-white/10 text-white/60 text-[9px] font-bold uppercase tracking-widest px-3 py-1 flex items-center gap-1 hover:bg-white/20 transition-colors"
                  >
                    {brand} <X size={10} />
                  </Link>
                )}
                {price !== "all" && (
                  <Link
                    href={getFilterUrl("price", "all")}
                    className="bg-white/10 text-white/60 text-[9px] font-bold uppercase tracking-widest px-3 py-1 flex items-center gap-1 hover:bg-white/20 transition-colors"
                  >
                    {t("price")} {price} <X size={10} />
                  </Link>
                )}
                <Link
                  href="/search"
                  className="text-[9px] font-bold text-accent/70 underline ml-2 hover:text-accent"
                >
                  {t("clearAll")}
                </Link>
              </div>
            )}

            {products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-lg font-bold text-white/20 mb-3">
                  {t("noResults")}
                </p>
                <Link
                  href="/products"
                  className="inline-block mt-3 bg-accent text-white px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-accent/80 transition-all"
                >
                  {t("viewCollection")}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                {products.map((product: Product) => (
                  <ProductItem key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex justify-center mt-8 gap-1.5">
                {[...Array(pages).keys()].map((x) => (
                  <Link
                    key={x + 1}
                    href={getFilterUrl("page", (x + 1).toString())}
                    className={`w-9 h-9 flex items-center justify-center text-xs font-bold transition-all ${
                      Number(page) === x + 1
                        ? "bg-accent text-white"
                        : "bg-white/5 text-white/40 hover:bg-white/10"
                    }`}
                  >
                    {x + 1}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const {
    q = "all",
    category = "all",
    subCategory = "all",
    brand = "all",
    price = "all",
    rating = "all",
    sort = "newest",
    page = "1",
  } = params;

  const pageNumber = Number(page) || 1;
  const pageSize = 12;

  await db.connect();

  const queryFilter =
    q && q !== "all"
      ? {
          name: {
            $regex: q,
            $options: "i",
          },
        }
      : {};

  const categoryFilter = category && category !== "all" ? { category } : {};
  const subCategoryFilter =
    subCategory && subCategory !== "all" ? { subCategory } : {};
  const brandFilter = brand && brand !== "all" ? { brand } : {};
  const ratingFilter =
    rating && rating !== "all"
      ? {
          rating: {
            $gte: Number(rating),
          },
        }
      : {};

  const priceFilter =
    price && price !== "all"
      ? {
          price: {
            $gte: Number(price.split("-")[0]),
            $lte: Number(price.split("-")[1]),
          },
        }
      : {};

  const order: Record<string, 1 | -1> =
    sort === "featured"
      ? { isFeatured: -1 }
      : sort === "lowest"
      ? { price: 1 }
      : sort === "highest"
      ? { price: -1 }
      : sort === "toprated"
      ? { rating: -1 }
      : sort === "newest"
      ? { createdAt: -1 }
      : { _id: -1 };

  const filter = {
    ...queryFilter,
    ...categoryFilter,
    ...subCategoryFilter,
    ...brandFilter,
    ...priceFilter,
    ...ratingFilter,
  };

  const [productDocs, countProducts, categoriesList, brandsList] =
    await Promise.all([
      ProductModel.find(filter)
        .sort(order)
        .skip(pageSize * (pageNumber - 1))
        .limit(pageSize)
        .lean(),
      ProductModel.countDocuments(filter),
      ProductModel.find().distinct("category"),
      ProductModel.find().distinct("brand"),
    ]);

  const products = productDocs.map(
    (doc) => db.convertDocToObj(doc as MongoDocument) as unknown as Product
  );
  const pages = Math.ceil(countProducts / pageSize);
  const categories: string[] = categoriesList;
  const brands: string[] = brandsList;

  const getFilterUrl = (key: string, value: string) => {
    const newParams = new URLSearchParams();
    if (q && q !== "all") newParams.set("q", q);
    if (category && category !== "all") newParams.set("category", category);
    if (subCategory && subCategory !== "all")
      newParams.set("subCategory", subCategory);
    if (brand && brand !== "all") newParams.set("brand", brand);
    if (price && price !== "all") newParams.set("price", price);
    if (rating && rating !== "all") newParams.set("rating", rating);
    if (sort && sort !== "newest") newParams.set("sort", sort);
    if (page && page !== "1") newParams.set("page", page);

    newParams.set(key, value);
    if (key !== "page") newParams.set("page", "1");

    return `/search?${newParams.toString()}`;
  };

  return (
    <SearchContent
      products={products}
      countProducts={countProducts}
      categories={categories}
      brands={brands}
      q={q}
      category={category}
      subCategory={subCategory}
      brand={brand}
      price={price}
      rating={rating}
      sort={sort}
      page={page}
      pages={pages}
      getFilterUrl={getFilterUrl}
    />
  );
}
