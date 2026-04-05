"use client";

import ProductGallery from "@/components/ProductGallery";
import ProductPurchase from "@/components/ProductPurchase";
import { Product } from "@/types";
import { RotateCcw, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";

export default function ProductDetailsContent({ product }: { product: Product }) {
  const t = useTranslations("product");
  const tn = useTranslations("nav");

  const allImages = [product.image, ...(product.colorImages || []).map((ci) => ci.image).filter(Boolean)].filter(
    (img, i, arr) => Boolean(img) && arr.indexOf(img) === i
  );

  const [displayImage, setDisplayImage] = useState(product.image);

  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;

  return (
    <div className="bg-secondary min-h-screen">
      <div className="max-w-7xl mx-auto px-3 md:px-8 py-4 md:py-8">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap text-[8px] md:text-[10px] text-primary/40 mb-4 md:mb-8 uppercase tracking-[0.15em] gap-1.5 md:gap-2 items-center">
          <Link href="/" className="hover:text-accent transition-colors">
            {tn("home")}
          </Link>
          <span className="text-primary/20">›</span>
          <Link href="/products" className="hover:text-accent transition-colors">
            {product.category}
          </Link>
          <span className="text-primary/20">›</span>
          <span className="text-primary/60 font-medium truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Gallery */}
          <ProductGallery
            images={allImages}
            displayImage={displayImage}
            onSelect={setDisplayImage}
            productName={product.name}
          />

          {/* Info */}
          <div className="flex flex-col">
            {/* Title & Brand */}
            <div className="mb-4 md:mb-6">
              <h1 className="text-md md:text-xl lg:text-2xl font-bold text-primary uppercase tracking-wide mb-1">
                {product.name}
              </h1>
              <p className="text-xs md:text-sm text-primary/40 uppercase tracking-wider">{product.brand}</p>
              {product.parentCategory === "gros" && (
                <span className="inline-block mt-1 bg-accent/10 text-accent text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
                  Wholesale / Gros
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-5 md:mb-8">
              <span className="text-xl md:text-3xl font-bold text-primary">{displayPrice.toLocaleString("en-US")}</span>
              <span className="text-sm md:text-base text-primary/40">TND</span>
              {hasDiscount && (
                <span className="text-sm text-primary/30 line-through ml-2">
                  {product.price.toLocaleString("en-US")} TND
                </span>
              )}
              <span className="text-xs text-primary/40 ml-1">/ unité</span>
            </div>

            {/* Purchase interactions (rating, selectors, qty, cart, wishlist) */}
            <ProductPurchase
              product={product}
              displayPrice={displayPrice}
              hasDiscount={hasDiscount}
              onColorSelect={setDisplayImage}
            />

            {/* Delivery & Returns */}
            <div className="border-t border-gray-200 pt-4 md:pt-6 mb-5 md:mb-8">
              <h3 className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-wider mb-3">
                {t("deliveryReturns")}
              </h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2.5">
                  <Truck className="w-4 h-4 text-primary/40 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] md:text-xs text-primary/60">
                    {t("fastDelivery")}{" "}
                    <span className="font-semibold text-primary">{product.deliveryTime || t("defaultDelivery")}</span>
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <RotateCcw className="w-4 h-4 text-primary/40 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] md:text-xs text-primary/60">{t("freeReturn")}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-gray-200 pt-4 md:pt-6 mb-5 md:mb-8">
              <h3 className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-wider mb-3">
                {t("description")}
              </h3>
              <p className="text-[11px] md:text-sm text-primary/60 leading-relaxed">{product.description}</p>
            </div>

            {/* Characteristics */}
            {(product.dimensions || product.weight || product.cbm) && (
              <div className="border-t border-gray-200 pt-4 md:pt-6">
                <h3 className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-wider mb-3">
                  {t("characteristics")}
                </h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                  {product.dimensions && (
                    <p className="text-[10px] md:text-xs text-primary/50">
                      • {t("sizeChar")}: <span className="text-primary/80">{product.dimensions}</span>
                    </p>
                  )}
                  {product.weight && (
                    <p className="text-[10px] md:text-xs text-primary/50">
                      • {t("weightChar")}: <span className="text-primary/80">{product.weight}</span>
                    </p>
                  )}
                  {product.cbm && (
                    <p className="text-[10px] md:text-xs text-primary/50">
                      • {t("volumeChar")}: <span className="text-primary/80">{product.cbm} m³</span>
                    </p>
                  )}
                  <p className="text-[10px] md:text-xs text-primary/50">
                    • {t("categoryChar")}: <span className="text-primary/80">{product.subCategory}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
