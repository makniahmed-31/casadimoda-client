"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useStore } from "@/utils/context/Store";
import {
  ChevronLeft,
  ChevronRight,
  Truck,
  RotateCcw,
  Heart,
  Star,
  Plus,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Product, CartVariation } from "@/types";
import { apiFetch } from "@/utils/api";

interface ProductDetailsContentProps {
  product: Product;
}

// Map French color names to CSS hex values for swatches
const COLOR_MAP: Record<string, string> = {
  Noir: "#111111",
  Blanc: "#f5f5f5",
  "Blanc Total": "#f5f5f5",
  "Blanc / Gris": "#e5e7eb",
  "Blanc / Bleu": "#dbeafe",
  Rouge: "#dc2626",
  "Rouge Bordeaux": "#881337",
  "Rouge Carmin": "#9f1239",
  "Noir / Rouge": "#1f2937",
  Gris: "#9ca3af",
  "Gris Chiné": "#d1d5db",
  "Gris / Jaune": "#e5e4c2",
  Bleu: "#2563eb",
  "Bleu Nuit": "#1e3a5f",
  Vert: "#16a34a",
  "Vert Émeraude": "#059669",
  Or: "#c9a96e",
  "Or & Ivoire": "#ddc49a",
  Marine: "#1e3a5f",
  Fauve: "#a0522d",
  Étoupe: "#9e8e7e",
  Marron: "#78350f",
  "Marron Cognac": "#92400e",
  Argent: "#c0c0c0",
  "Noir / Argent": "#2d2d2d",
};

export default function ProductDetailsContent({
  product,
}: ProductDetailsContentProps) {
  const t = useTranslations("product");
  const tn = useTranslations("nav");
  const tp = useTranslations("products");
  const { data: session } = useSession();
  const { state, dispatch } = useStore();
  const [qty, setQty] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectionError, setSelectionError] = useState<string>("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [displayImage, setDisplayImage] = useState(product.image);
  const [dbColors, setDbColors] = useState<{ name: string; hex: string }[]>([]);
  const [avgRating, setAvgRating] = useState(product.rating || 0);
  const [numReviews, setNumReviews] = useState(product.numReviews || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [userRating, setUserRating] = useState(0);

  const isWholesale = product.parentCategory === "gros";
  const hasSizes = product.sizes && product.sizes.length > 0;
  const hasColors = product.colors && product.colors.length > 0;

  // Wholesale variations state
  const [variations, setVariations] = useState<CartVariation[]>([
    {
      color: product.colors?.[0] ?? "",
      size: product.sizes?.[0] ?? "",
      quantity: 1,
    },
  ]);

  useEffect(() => {
    apiFetch("/api/colors")
      .then((r) => r.json())
      .then(setDbColors)
      .catch(() => {});
  }, []);

  // Check wishlist status on mount
  useEffect(() => {
    if (!session || !product._id) return;
    apiFetch(`/api/wishlist?productId=${product._id}`)
      .then((r) => r.json())
      .then((data) => setIsWishlisted(data.isWishlisted))
      .catch(() => {});
  }, [session, product._id]);

  // Load user's existing rating
  useEffect(() => {
    if (!session || !product._id) return;
    apiFetch(`/api/reviews?productId=${product._id}`)
      .then((r) => r.json())
      .then((data) => {
        const mine = data.reviews?.find(
          (r: { user: { _id?: string; email?: string }; rating: number }) =>
            r.user?.email === session.user?.email,
        );
        if (mine) setUserRating(mine.rating);
      })
      .catch(() => {});
  }, [session, product._id]);

  const submitRating = async (stars: number) => {
    if (!session) {
      window.location.href = "/login";
      return;
    }
    setUserRating(stars);
    const res = await apiFetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product._id, rating: stars }),
    });
    if (res.ok) {
      const data = await res.json();
      setAvgRating(data.rating);
      setNumReviews(data.numReviews);
    }
  };

  const toggleWishlist = async () => {
    if (!session) {
      window.location.href = "/login";
      return;
    }
    setWishlistLoading(true);
    try {
      const method = isWishlisted ? "DELETE" : "POST";
      const res = await apiFetch("/api/wishlist", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id }),
      });
      const data = await res.json();
      setIsWishlisted(data.isWishlisted);
    } catch {
      // ignore
    } finally {
      setWishlistLoading(false);
    }
  };

  // Wholesale: add a new variation row
  const addVariationRow = () => {
    setVariations((v) => [
      ...v,
      { color: product.colors?.[0] ?? "", size: product.sizes?.[0] ?? "", quantity: 1 },
    ]);
    setSelectionError("");
  };

  const removeVariationRow = (i: number) => {
    setVariations((v) => v.filter((_, j) => j !== i));
  };

  const updateVariation = (
    i: number,
    field: keyof CartVariation,
    value: string | number,
  ) => {
    setVariations((v) =>
      v.map((row, j) =>
        j === i ? { ...row, [field]: value } : row,
      ),
    );
    setSelectionError("");
  };

  const addToCartHandler = () => {
    if (isWholesale) {
      // Wholesale: validate variations
      const invalid = variations.some(
        (v) =>
          (hasColors && !v.color) ||
          (hasSizes && !v.size) ||
          v.quantity < 1,
      );
      if (invalid || variations.length === 0) {
        setSelectionError(t("fillVariations"));
        return;
      }
      setSelectionError("");
      const totalQty = variations.reduce((s, v) => s + v.quantity, 0);
      if (product.countInStock < totalQty) {
        alert(t("outOfStockAlert"));
        return;
      }
      dispatch({
        type: "CART_ADD_ITEM",
        payload: {
          name: product.name,
          slug: product.slug,
          image: product.image,
          price: product.price,
          discountPrice: product.discountPrice,
          countInStock: product.countInStock,
          quantity: totalQty,
          sizes: product.sizes ?? [],
          colors: product.colors ?? [],
          parentCategory: "gros",
          variations,
        },
      });
    } else {
      // Retail: validate single color/size
      if (hasSizes && !selectedSize) {
        setSelectionError(t("chooseSize"));
        return;
      }
      if (hasColors && !selectedColor) {
        setSelectionError(t("chooseColor"));
        return;
      }
      setSelectionError("");
      const existItem = state.cart.cartItems.find((x) => x.slug === product.slug);
      const quantity = existItem ? existItem.quantity + qty : qty;
      if (product.countInStock < quantity) {
        alert(t("outOfStockAlert"));
        return;
      }
      dispatch({
        type: "CART_ADD_ITEM",
        payload: {
          name: product.name,
          slug: product.slug,
          image: product.image,
          price: product.price,
          discountPrice: product.discountPrice,
          countInStock: product.countInStock,
          quantity,
          selectedSize: selectedSize || undefined,
          selectedColor: selectedColor || undefined,
          sizes: product.sizes ?? [],
          colors: product.colors ?? [],
          parentCategory: "detail",
        },
      });
    }

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAdjusting = useCallback(
    (direction: "up" | "down") => {
      const adjust = () => {
        setQty((prev) => {
          if (direction === "up") {
            return Math.min(product.countInStock, prev + 1);
          } else {
            return Math.max(1, prev - 1);
          }
        });
      };

      adjust();

      timerRef.current = setTimeout(() => {
        intervalRef.current = setInterval(adjust, 100);
      }, 500);
    },
    [product.countInStock],
  );

  const stopAdjusting = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    return () => stopAdjusting();
  }, [stopAdjusting]);

  const hasDiscount =
    product.discountPrice > 0 && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;

  const wholesaleTotal = isWholesale
    ? variations.reduce((s, v) => s + v.quantity * displayPrice, 0)
    : 0;

  return (
    <div className="bg-secondary min-h-screen">
      <div className="max-w-7xl mx-auto px-3 md:px-8 py-4 md:py-8">
        {/* Breadcrumbs */}
        <nav className="flex flex-wrap text-[8px] md:text-[10px] text-primary/40 mb-4 md:mb-8 uppercase tracking-[0.15em] gap-1.5 md:gap-2 items-center">
          <Link href="/" className="hover:text-accent transition-colors">
            {tn("home")}
          </Link>
          <span className="text-primary/20">›</span>
          <Link
            href="/products"
            className="hover:text-accent transition-colors"
          >
            {product.category}
          </Link>
          <span className="text-primary/20">›</span>
          <span className="text-primary/60 font-medium truncate">
            {product.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12">
          {/* Image Column */}
          <div>
            <div className="relative aspect-square w-full overflow-hidden bg-white border border-gray-100">
              <Image
                src={displayImage}
                alt={product.name}
                fill
                className="object-contain p-6 md:p-10"
                priority
                unoptimized
              />
            </div>
          </div>

          {/* Info Column */}
          <div className="flex flex-col">
            {/* Title & Brand */}
            <div className="mb-4 md:mb-6">
              <h1 className="text-lg md:text-2xl font-bold text-primary uppercase tracking-wide mb-1">
                {product.name}
              </h1>
              <p className="text-xs md:text-sm text-primary/40 uppercase tracking-wider">
                {product.brand}
              </p>
              {isWholesale && (
                <span className="inline-block mt-1 bg-accent/10 text-accent text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
                  Wholesale / Gros
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-5 md:mb-8">
              {hasDiscount ? (
                <>
                  <span className="text-xl md:text-3xl font-bold text-primary">
                    {displayPrice.toLocaleString("en-US")}
                  </span>
                  <span className="text-sm md:text-base text-primary/40">TND</span>
                  <span className="text-sm text-primary/30 line-through ml-2">
                    {product.price.toLocaleString("en-US")} TND
                  </span>
                </>
              ) : (
                <>
                  <span className="text-xl md:text-3xl font-bold text-primary">
                    {displayPrice.toLocaleString("en-US")}
                  </span>
                  <span className="text-sm md:text-base text-primary/40">TND</span>
                </>
              )}
              <span className="text-xs text-primary/40 ml-1">/ unité</span>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4 md:mb-5">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => submitRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="cursor-pointer"
                  >
                    <Star
                      className={`w-4 h-4 transition-colors ${
                        star <= (hoverRating || userRating || avgRating)
                          ? "text-accent fill-accent"
                          : "text-primary/20"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-primary/40 font-medium">
                {avgRating > 0
                  ? `${avgRating.toFixed(1)} · ${numReviews} avis`
                  : "Aucun avis"}
              </span>
            </div>

            {/* ──────────────────────────────────────────
                WHOLESALE: Variation Builder
            ────────────────────────────────────────── */}
            {isWholesale ? (
              <div className="mb-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-3">
                  Configurer les quantités par couleur / taille
                </p>
                <div className="space-y-2">
                  {variations.map((v, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 bg-primary/5 border border-gray-200 p-2"
                    >
                      {hasColors && (
                        <select
                          value={v.color}
                          onChange={(e) => updateVariation(i, "color", e.target.value)}
                          className="flex-1 border border-gray-200 p-2 text-xs text-primary bg-white outline-none focus:border-accent"
                        >
                          <option value="">Couleur</option>
                          {product.colors.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      )}
                      {hasSizes && (
                        <select
                          value={v.size}
                          onChange={(e) => updateVariation(i, "size", e.target.value)}
                          className="flex-1 border border-gray-200 p-2 text-xs text-primary bg-white outline-none focus:border-accent"
                        >
                          <option value="">Taille</option>
                          {product.sizes.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      )}
                      <input
                        type="number"
                        min={1}
                        max={product.countInStock}
                        value={v.quantity}
                        onChange={(e) =>
                          updateVariation(i, "quantity", Math.max(1, parseInt(e.target.value) || 1))
                        }
                        className="w-16 border border-gray-200 p-2 text-xs text-primary text-center bg-white outline-none focus:border-accent"
                      />
                      <span className="text-[10px] text-primary/40 font-bold w-20 text-right">
                        {(v.quantity * displayPrice).toLocaleString()} TND
                      </span>
                      {variations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariationRow(i)}
                          className="text-red-400 hover:text-red-600 cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addVariationRow}
                  className="mt-2 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-accent hover:text-accent/70 cursor-pointer transition-colors"
                >
                  <Plus size={12} /> Ajouter une variante
                </button>

                {/* Wholesale total */}
                <div className="mt-3 flex justify-between items-center border-t border-gray-200 pt-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">
                    Total ({variations.reduce((s, v) => s + v.quantity, 0)} unités)
                  </span>
                  <span className="text-lg font-black text-primary">
                    {wholesaleTotal.toLocaleString()} TND
                  </span>
                </div>
              </div>
            ) : (
              <>
                {/* RETAIL: Color Selector */}
                {hasColors && (
                  <div className="mb-4 md:mb-5">
                    <p className="text-[9px] md:text-[11px] font-bold text-primary/40 uppercase tracking-widest mb-2">
                      {t("colorLabel")} :{" "}
                      {selectedColor && (
                        <span className="text-primary/70 font-bold">
                          {selectedColor}
                        </span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color) => {
                        const colorImg = product.colorImages?.find(
                          (ci) => ci.color === color,
                        );
                        const hex =
                          colorImg?.hex ||
                          dbColors.find((c) => c.name === color)?.hex ||
                          COLOR_MAP[color] ||
                          "#888";
                        const isLight =
                          hex === "#ffffff" ||
                          hex === "#f5f5f5" ||
                          hex === "#e5e7eb" ||
                          hex === "#d1d5db" ||
                          ["Blanc", "Blanc Total", "Blanc / Gris", "Gris Chiné"].includes(color);
                        return (
                          <button
                            key={color}
                            title={color}
                            onClick={() => {
                              setSelectedColor(color);
                              setSelectionError("");
                              setDisplayImage(colorImg?.image || product.image);
                            }}
                            className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                              selectedColor === color
                                ? "border-accent scale-110 shadow-md"
                                : isLight
                                  ? "border-gray-300 hover:border-accent"
                                  : "border-transparent hover:border-accent"
                            }`}
                            style={{ backgroundColor: hex }}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* RETAIL: Size Selector */}
                {hasSizes && (
                  <div className="mb-4 md:mb-5">
                    <p className="text-[9px] md:text-[11px] font-bold text-primary/40 uppercase tracking-widest mb-2">
                      {t("sizeLabel")} :{" "}
                      {selectedSize && (
                        <span className="text-primary/70 font-bold">
                          {selectedSize}
                        </span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => {
                            setSelectedSize(size);
                            setSelectionError("");
                          }}
                          className={`min-w-[2.25rem] h-9 px-2.5 border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            selectedSize === size
                              ? "border-primary bg-primary text-white"
                              : "border-gray-200 text-primary hover:border-primary"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* RETAIL: Quantity */}
                <div className="mb-4 md:mb-5">
                  <p className="text-[9px] md:text-[11px] font-bold text-primary/40 uppercase tracking-widest mb-2">
                    {t("quantityLabel")} :
                  </p>
                  <div className="flex items-center gap-0">
                    <button
                      type="button"
                      onMouseDown={() => startAdjusting("down")}
                      onMouseUp={stopAdjusting}
                      onMouseLeave={stopAdjusting}
                      onTouchStart={() => startAdjusting("down")}
                      onTouchEnd={stopAdjusting}
                      className="w-9 h-9 md:w-10 md:h-10 border border-gray-200 flex items-center justify-center hover:border-primary transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                      disabled={qty <= 1}
                    >
                      <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                    </button>
                    <span className="w-10 h-9 md:w-12 md:h-10 border-y border-gray-200 flex items-center justify-center text-sm font-bold text-primary">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onMouseDown={() => startAdjusting("up")}
                      onMouseUp={stopAdjusting}
                      onMouseLeave={stopAdjusting}
                      onTouchStart={() => startAdjusting("up")}
                      onTouchEnd={stopAdjusting}
                      className="w-9 h-9 md:w-10 md:h-10 border border-gray-200 flex items-center justify-center hover:border-primary transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                      disabled={qty >= product.countInStock}
                    >
                      <ChevronRight className="w-4 h-4" strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setQty(Math.min(product.countInStock, qty + 10))
                      }
                      className="ml-2 text-[9px] md:text-[10px] font-bold text-accent border border-accent/30 px-2.5 py-2 hover:bg-accent hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                      disabled={qty >= product.countInStock}
                    >
                      +10
                    </button>
                    <span className="ml-3 text-[10px] text-primary/30">
                      {product.countInStock} {t("available")}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Selection Error */}
            {selectionError && (
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-3 -mt-1">
                ⚠ {selectionError}
              </p>
            )}

            {/* Add to Cart Button */}
            <button
              onClick={addToCartHandler}
              disabled={product.countInStock === 0}
              className={`w-full py-3 md:py-3.5 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs transition-all cursor-pointer mb-2 ${
                isAdded
                  ? "bg-green-700 text-white"
                  : "bg-primary text-white hover:bg-accent"
              } disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed`}
            >
              {isAdded
                ? t("addedToCart")
                : isWholesale
                  ? tp("configureOrder")
                  : tp("addToCart")}
            </button>

            {/* Wishlist */}
            <button
              onClick={toggleWishlist}
              disabled={wishlistLoading}
              className={`w-full py-2.5 md:py-3 border text-[10px] md:text-xs font-medium uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 mb-5 md:mb-8 disabled:opacity-50 disabled:cursor-not-allowed ${
                isWishlisted
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-gray-200 hover:border-primary text-primary/60 hover:text-primary"
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${isWishlisted ? "fill-accent" : ""}`}
              />
              {isWishlisted ? t("removeFromWishlist") : t("addToWishlist")}
            </button>

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
                    <span className="font-semibold text-primary">
                      {product.deliveryTime || t("defaultDelivery")}
                    </span>
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <RotateCcw className="w-4 h-4 text-primary/40 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] md:text-xs text-primary/60">
                    {t("freeReturn")}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-gray-200 pt-4 md:pt-6 mb-5 md:mb-8">
              <h3 className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-wider mb-3">
                {t("description")}
              </h3>
              <p className="text-[11px] md:text-sm text-primary/60 leading-relaxed">
                {product.description}
              </p>
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
                      • {t("sizeChar")}:{" "}
                      <span className="text-primary/80">{product.dimensions}</span>
                    </p>
                  )}
                  {product.weight && (
                    <p className="text-[10px] md:text-xs text-primary/50">
                      • {t("weightChar")}:{" "}
                      <span className="text-primary/80">{product.weight}</span>
                    </p>
                  )}
                  {product.cbm && (
                    <p className="text-[10px] md:text-xs text-primary/50">
                      • {t("volumeChar")}:{" "}
                      <span className="text-primary/80">{product.cbm} m³</span>
                    </p>
                  )}
                  <p className="text-[10px] md:text-xs text-primary/50">
                    • {t("categoryChar")}:{" "}
                    <span className="text-primary/80">{product.subCategory}</span>
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
