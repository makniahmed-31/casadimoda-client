import db from "@/utils/db";
import Supplier from "@/models/Supplier";
import Product from "@/models/Product";
import { Product as ProductType, Supplier as SupplierType } from "@/types";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Store, Star, Package, MapPin } from "lucide-react";
import ProductItem from "@/components/ProductItem";
import { getTranslations } from "next-intl/server";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function SupplierStorefrontPage({ params }: Props) {
  const { slug } = await params;
  const t = await getTranslations("supplierStore");

  await db.connect();

  const supplierDoc = await Supplier.findOne({
    businessSlug: slug,
    status: "approved",
  }).lean();

  if (!supplierDoc) {
    notFound();
  }

  const products = await Product.find({
    supplier: supplierDoc._id,
    approvalStatus: "approved",
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  const supplier = db.convertDocToObj(supplierDoc) as unknown as SupplierType;
  const supplierProducts = products.map((p) => db.convertDocToObj(p) as unknown as ProductType);

  return (
    <div className="bg-[#2a2a2a] min-h-screen">
      {/* Hero Banner */}
      <div className="relative h-48 md:h-64 bg-primary">
        {supplier.businessBanner && (
          <Image
            src={supplier.businessBanner}
            alt={supplier.businessName}
            fill
            className="object-cover opacity-30"
            unoptimized
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2a2a2a] to-transparent" />
      </div>

      {/* Supplier Info Card */}
      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-10">
        <div className="bg-[#363636] border border-white/[0.08] p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Logo */}
            <div className="w-20 h-20 md:w-28 md:h-28 bg-[#2a2a2a] flex items-center justify-center overflow-hidden border border-white/10 -mt-14 md:-mt-18">
              {supplier.businessLogo ? (
                <Image
                  src={supplier.businessLogo}
                  alt={supplier.businessName}
                  width={112}
                  height={112}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              ) : (
                <Store size={40} className="text-accent" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="font-serif text-2xl md:text-3xl text-white italic">
                {supplier.businessName}
              </h1>
              {supplier.businessDescription && (
                <p className="text-white/40 mt-2 max-w-2xl text-sm">
                  {supplier.businessDescription}
                </p>
              )}
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-1.5 text-xs">
                  <Star size={14} className="text-accent fill-accent" />
                  <span className="font-bold text-white">
                    {supplier.rating?.toFixed(1) || "0.0"}
                  </span>
                  <span className="text-white/30">
                    ({supplier.numReviews || 0} {t("reviews")})
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-white/40">
                  <Package size={14} />
                  <span>{supplier.totalProducts || 0} {t("products")}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-white/40">
                  <MapPin size={14} />
                  <span>
                    {supplier.address.city}, {supplier.address.country}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-6 md:mb-8">
          <p className="text-accent font-medium uppercase tracking-[0.4em] text-[10px] md:text-xs mb-2">
            {t("collection")}
          </p>
          <h2 className="font-serif text-xl md:text-2xl text-white italic">
            {t("productsOf")} {supplier.businessName}
          </h2>
        </div>

        {supplierProducts.length === 0 ? (
          <div className="text-center py-16">
            <Package size={48} className="text-white/10 mx-auto mb-3" />
            <p className="text-white/20 font-bold text-sm">
              {t("noProducts")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
            {supplierProducts.map((product) => (
              <ProductItem key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;

  await db.connect();
  const supplier = await Supplier.findOne({
    businessSlug: slug,
    status: "approved",
  }).lean();

  if (!supplier) {
    return {
      title: "Supplier Not Found",
    };
  }

  return {
    title: `${supplier.businessName} - Casa di Moda`,
    description:
      supplier.businessDescription ||
      `Shop products from ${supplier.businessName} on Casa di Moda`,
  };
}
