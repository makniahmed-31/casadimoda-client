import ProductItem from "@/components/ProductItem";
import { Product } from "@/types";
import Pagination from "@/components/Pagination";
import db from "@/utils/db";
import ProductModel from "@/models/Product";
import { MongoDocument } from "@/utils/db";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

function WholesaleContent({
  products,
  page,
  pageSize,
  totalProducts,
  totalPages,
}: {
  products: Product[];
  page: number;
  pageSize: number;
  totalProducts: number;
  totalPages: number;
}) {
  const t = useTranslations("wholesale");

  return (
    <div className="bg-[#2a2a2a] min-h-screen">
      {/* Hero Section */}
      <div className="bg-primary">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 text-white">
          <p className="text-accent font-medium uppercase tracking-[0.4em] text-[10px] md:text-xs mb-3">
            {t("title")}
          </p>
          <h1 className="font-serif text-3xl md:text-5xl text-white italic mb-4">
            {t("subtitle")}
          </h1>
          <p className="text-white/50 max-w-2xl text-sm leading-relaxed mb-8">
            {t("description")}
          </p>
          <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-xl">
            <div className="bg-white/5 border border-white/10 p-3 md:p-4 text-center">
              <p className="text-accent font-bold text-[8px] md:text-[10px] uppercase tracking-widest mb-1">
                {t("minOrder")}
              </p>
              <p className="text-lg md:text-xl font-bold">{t("minOrderValue")}</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-3 md:p-4 text-center">
              <p className="text-accent font-bold text-[8px] md:text-[10px] uppercase tracking-widest mb-1">
                {t("discount")}
              </p>
              <p className="text-lg md:text-xl font-bold">{t("discountValue")}</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-3 md:p-4 text-center">
              <p className="text-accent font-bold text-[8px] md:text-[10px] uppercase tracking-widest mb-1">
                {t("payment")}
              </p>
              <p className="text-lg md:text-xl font-bold">{t("paymentValue")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
          <div>
            <p className="text-accent font-medium uppercase tracking-[0.4em] text-[10px] md:text-xs mb-2">
              {t("catalog")}
            </p>
            <h2 className="font-serif text-2xl md:text-3xl text-white italic">
              {t("availableProducts")}
            </h2>
          </div>
          <p className="text-white/30 text-xs">
            {(page - 1) * pageSize + 1}-
            {Math.min(page * pageSize, totalProducts)} {t("of")} {totalProducts}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
          {products.map((product) => (
            <ProductItem key={product.slug} product={product} />
          ))}
        </div>

        <Pagination totalPages={totalPages} />

        {/* Contact CTA */}
        <div className="mt-12 bg-primary border border-white/[0.08] p-8 md:p-12 text-center">
          <h3 className="font-serif text-xl md:text-2xl text-white italic mb-3">
            {t("readyToPartner")}
          </h3>
          <p className="text-white/40 mb-6 max-w-xl mx-auto text-sm">
            {t("contactTeamDesc")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="mailto:wholesale@casadimoda.com"
              className="bg-accent text-white px-8 py-3 font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-white hover:text-primary transition-all"
            >
              {t("contactTeam")}
            </Link>
            <Link
              href="/vip-store"
              className="border border-white/20 text-white px-8 py-3 font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-white hover:text-primary transition-all"
            >
              {t("vipStore")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function WholesalePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = 12;
  const skip = (page - 1) * pageSize;

  await db.connect();
  const totalProducts = await ProductModel.countDocuments();
  const docs = await ProductModel.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize)
    .lean();

  const products = docs.map(
    (doc) => db.convertDocToObj(doc as MongoDocument) as unknown as Product,
  );
  const totalPages = Math.ceil(totalProducts / pageSize);

  return (
    <WholesaleContent
      products={products}
      page={page}
      pageSize={pageSize}
      totalProducts={totalProducts}
      totalPages={totalPages}
    />
  );
}
