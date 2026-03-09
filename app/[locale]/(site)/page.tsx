import { Product } from "@/types";
import db from "@/utils/db";
import ProductModel from "@/models/Product";
import { MongoDocument } from "@/utils/db";
import { Link } from "@/i18n/routing";
import HeroCarousel from "@/components/HeroCarousel";
import FeaturedProductsGrid from "@/components/FeaturedProductsGrid";
import { useTranslations } from "next-intl";

export default async function Home() {
  await db.connect();

  const featuredDocs = await ProductModel.find({ isFeatured: true })
    .sort({ createdAt: -1 })
    .lean();

  const featuredProducts = featuredDocs.map(
    (doc) => db.convertDocToObj(doc as MongoDocument) as unknown as Product,
  );

  return <HomeContent featuredProducts={featuredProducts} />;
}

function HomeContent({ featuredProducts }: { featuredProducts: Product[] }) {
  const t = useTranslations("homepage");
  const tc = useTranslations("common");

  const heroSlides = [
    {
      type: "image" as const,
      src: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070",
      alt: "Haute Couture",
      title: t("heroSlide1Title"),
      subtitle: t("heroSlide1Subtitle"),
      description: t("heroSlide1Desc"),
    },
    {
      type: "image" as const,
      src: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070",
      alt: "Collection Printemps",
      title: t("heroSlide2Title"),
      subtitle: t("heroSlide2Subtitle"),
      description: t("heroSlide2Desc"),
    },
    {
      type: "image" as const,
      src: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070",
      alt: "Collection Luxe",
      title: t("heroSlide3Title"),
      subtitle: t("heroSlide3Subtitle"),
      description: t("heroSlide3Desc"),
    },
    {
      type: "image" as const,
      src: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070",
      alt: "VIP Exclusif",
      title: t("heroSlide4Title"),
      subtitle: t("heroSlide4Subtitle"),
      description: t("heroSlide4Desc"),
    },
  ];

  return (
    <div>
      {/* Full-width Hero Carousel with category cards inside */}
      <HeroCarousel slides={heroSlides} autoplayInterval={5000} />

      {/* Découvrez Nos Univers - Dark Section */}
      <div className="bg-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%221%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
          <div className="mb-8 md:mb-12">
            <div className="flex items-center justify-center gap-4 md:gap-8">
              <div className="h-px flex-1 bg-accent/50" />
              <h2 className="font-serif text-2xl md:text-4xl text-white italic whitespace-nowrap">
                {t("discoverWorlds")}
              </h2>
              <div className="h-px flex-1 bg-accent/50" />
            </div>
            <div className="h-px w-full bg-accent/30 mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <Link
              href="/products"
              className="group block border border-accent/30 hover:border-accent/60 transition-all duration-500 overflow-hidden bg-primary/80"
            >
              <div className="relative h-48 md:h-56 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200"
                  alt={t("boutiqueB2C")}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="p-4 md:p-5 text-center border-t border-accent/20">
                <h3 className="font-serif text-lg md:text-xl text-white mb-1 italic">
                  {t("boutiqueB2C")}
                </h3>
                <p className="text-white/40 text-[10px] md:text-xs tracking-wider">
                  {t("fashionAccessories")}
                </p>
              </div>
            </Link>

            <Link
              href="/wholesale"
              className="group block border border-accent/30 hover:border-accent/60 transition-all duration-500 overflow-hidden bg-primary/80"
            >
              <div className="relative h-48 md:h-56 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?q=80&w=1200"
                  alt={t("wholesaleB2B")}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="p-4 md:p-5 text-center border-t border-accent/20">
                <h3 className="font-serif text-lg md:text-xl text-white mb-1 italic">
                  {t("wholesaleB2B")}
                </h3>
                <p className="text-white/40 text-[10px] md:text-xs tracking-wider">
                  {t("wholesaleSales")}
                </p>
              </div>
            </Link>

            <Link
              href="/vip-store"
              className="group block border border-accent/30 hover:border-accent/60 transition-all duration-500 overflow-hidden bg-primary/80"
            >
              <div className="relative h-48 md:h-56 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200"
                  alt={t("vipStore")}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="p-4 md:p-5 text-center border-t border-accent/20">
                <h3 className="font-serif text-lg md:text-xl text-white mb-1 italic">
                  {t("vipStore")}
                </h3>
                <p className="text-white/40 text-[10px] md:text-xs tracking-wider">
                  {t("customCreation")}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* 2x2 Service Grid Section - Dark */}
      <div className="bg-[#2a2a2a] py-12 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
            {/* Shop B2C */}
            <Link
              href="/products"
              className="group block relative aspect-[16/9] overflow-hidden"
            >
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200"
                alt={t("shopB2C")}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-4 py-3 md:px-5 md:py-4">
                <p className="text-white/90 uppercase tracking-wider text-[10px] md:text-xs font-bold">
                  {t("shopB2C")} —{" "}
                  <span className="text-white/50 font-normal">
                    {t("discoverLuxuryBrands")}
                  </span>
                </p>
              </div>
            </Link>

            {/* Wholesale B2B */}
            <Link
              href="/wholesale"
              className="group block relative aspect-[16/9] overflow-hidden"
            >
              <img
                src="https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?q=80&w=1200"
                alt={t("wholesaleB2BLabel")}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-4 py-3 md:px-5 md:py-4">
                <p className="text-white/90 uppercase tracking-wider text-[10px] md:text-xs font-bold">
                  {t("wholesaleB2BLabel")} —{" "}
                  <span className="text-white/50 font-normal">
                    {t("premiumFabrics")}
                  </span>
                </p>
              </div>
            </Link>

            {/* VIP Store */}
            <Link
              href="/vip-store"
              className="group block relative aspect-[16/9] overflow-hidden"
            >
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200"
                alt={t("vipStoreLabel")}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-4 py-3 md:px-5 md:py-4">
                <p className="text-white/90 uppercase tracking-wider text-[10px] md:text-xs font-bold">
                  {t("vipStoreLabel")} —{" "}
                  <span className="text-white/50 font-normal">
                    {t("bespokeDesign")}
                  </span>
                </p>
              </div>
            </Link>

            {/* Become a Partner */}
            <Link
              href="/become-supplier"
              className="group block relative aspect-[16/9] overflow-hidden"
            >
              <img
                src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200"
                alt={t("becomePartner")}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-4 py-3 md:px-5 md:py-4">
                <p className="text-white/90 uppercase tracking-wider text-[10px] md:text-xs font-bold">
                  {t("becomePartner")} —{" "}
                  <span className="text-white/50 font-normal">
                    {t("joinNetwork")}
                  </span>
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Brand Statement Section - Dark with side-by-side fashion images */}

      <div className="relative bg-[#2a2a2a] h-[calc(100dvh-var(--header-height,0px))]">
        {/* Two fashion images side by side - fill the section */}
        <div className="grid grid-cols-2 h-full">
          <div className="relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200"
              alt="Collection Femme"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200"
              alt="Collection Homme"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Brand text absolute at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 text-center pb-8 md:pb-12 bg-gradient-to-t from-black/60 to-transparent pt-20">
          <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl text-white tracking-wider mb-3 md:mb-4">
            {tc("brandUpper")}
          </h2>
          <p className="text-white/50 uppercase tracking-[0.4em] text-[10px] md:text-sm font-medium">
            {t("curateCreateConnect")}
          </p>
        </div>
      </div>

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <div className="bg-[#2a2a2a]">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
            <div className="text-center mb-8 md:mb-12">
              <p className="text-accent font-medium uppercase tracking-[0.4em] text-[10px] md:text-xs mb-3">
                {t("exclusiveSelection")}
              </p>
              <h2 className="font-serif text-3xl md:text-4xl text-white italic">
                {t("featuredProducts")}
              </h2>
              <div className="w-16 h-[2px] bg-accent mx-auto mt-4" />
            </div>

            <FeaturedProductsGrid products={featuredProducts} pageSize={10} />
          </div>
        </div>
      )}

      {/* Bottom CTA Section */}
      <div className="bg-primary">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20 text-center">
          <p className="text-accent font-medium uppercase tracking-[0.4em] text-[10px] md:text-xs mb-4">
            {tc("brand")}
          </p>
          <h3 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white mb-4 md:mb-6 italic">
            {t("readyForLuxury")}
          </h3>
          <p className="text-white/50 mb-8 md:mb-10 max-w-xl mx-auto text-sm md:text-base">
            {t("joinCommunity")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Link
              href="/products"
              className="bg-accent text-white px-8 md:px-10 py-3 md:py-4 font-bold uppercase text-[10px] md:text-xs tracking-[0.2em] hover:bg-white hover:text-primary transition-all"
            >
              {t("browseCollection")}
            </Link>
            <Link
              href="/vip-store"
              className="border border-white/30 text-white px-8 md:px-10 py-3 md:py-4 font-bold uppercase text-[10px] md:text-xs tracking-[0.2em] hover:bg-white hover:text-primary transition-all"
            >
              {t("contactVIP")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
