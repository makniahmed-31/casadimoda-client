"use client";

import { Link } from "@/i18n/routing";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useStore } from "@/utils/context/Store";
import { useSession } from "next-auth/react";
import { Product } from "@/types";
import { Heart, Star, ShoppingBag } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/utils/api";

// Module-level cache so colors are fetched only once per page load
let _dbColorsCache: { name: string; hex: string }[] = [];
let _dbColorsFetched = false;

// Module-level wishlist cache — fetched once per session
let _wishlistCache: Set<string> = new Set();
let _wishlistFetched = false;
const _wishlistListeners: Set<() => void> = new Set();

const COLOR_MAP: Record<string, string> = {
  Noir: "#111111",
  Blanc: "#f5f5f5",
  "Blanc Total": "#f5f5f5",
  "Blanc / Gris": "#e5e7eb",
  "Blanc / Bleu": "#dbeafe",
  Rouge: "#dc2626",
  "Rouge Bordeaux": "#881337",
  "Rouge Carmin": "#9f1239",
  Bordeaux: "#881337",
  "Noir / Rouge": "#1f2937",
  Gris: "#9ca3af",
  "Gris Chiné": "#d1d5db",
  "Gris / Jaune": "#9ca3af",
  Bleu: "#2563eb",
  "Bleu Nuit": "#1e3a5f",
  "Bleu Ciel": "#7dd3fc",
  Marine: "#1e3a5f",
  Marron: "#78350f",
  "Marron Cognac": "#8b4513",
  Vert: "#16a34a",
  "Vert Émeraude": "#059669",
  Or: "#c9a96e",
  "Or Jaune": "#d4a853",
  "Or Rose": "#e8b4a0",
  "Or & Ivoire": "#c9a96e",
  Argent: "#c0c0c0",
  "Noir / Argent": "#2d2d2d",
  Fauve: "#c8860a",
  Étoupe: "#9e9082",
  Caramel: "#c68642",
  Crème: "#fffdd0",
  Ivoire: "#fffff0",
  Beige: "#f5f0e8",
  Rose: "#f9a8d4",
  Nude: "#e8c9a0",
  Lavande: "#c4b5fd",
  Violet: "#7c3aed",
  Orange: "#f97316",
  Jaune: "#eab308",
};

interface ProductItemProps {
  product: Product;
}

export default function ProductItem({ product }: ProductItemProps) {
  const t = useTranslations("products");
  const tc = useTranslations("common");
  const { state, dispatch } = useStore();
  const { data: session, status } = useSession();
  const userRole = (session?.user as { role?: string })?.role;
  const isCustomer = status === "unauthenticated" || userRole === "customer";
  const [isWishlisted, setIsWishlisted] = useState(() =>
    _wishlistCache.has(product._id),
  );
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [heartPop, setHeartPop] = useState(false);
  const [avgRating, setAvgRating] = useState(product.rating || 0);
  const [numReviews, setNumReviews] = useState(product.numReviews || 0);
  const [showRating, setShowRating] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const firstColor = product.colors?.[0] ?? null;
  const firstImage = firstColor
    ? (product.colorImages?.find((ci) => ci.color === firstColor)?.image ??
      product.image)
    : product.image;

  const [activeImage, setActiveImage] = useState(firstImage);
  const [activeColor, setActiveColor] = useState<string | null>(firstColor);
  const [dbColors, setDbColors] = useState<{ name: string; hex: string }[]>(
    _dbColorsCache,
  );

  // Sync wishlist state if cache updates after mount
  useEffect(() => {
    const sync = () => setIsWishlisted(_wishlistCache.has(product._id));
    _wishlistListeners.add(sync);
    return () => { _wishlistListeners.delete(sync); };
  }, [product._id]);

  // Reset cache on logout
  useEffect(() => {
    if (!session && _wishlistFetched) {
      _wishlistFetched = false;
      _wishlistCache = new Set();
      _wishlistListeners.forEach((fn) => fn());
    }
  }, [session]);

  // Fetch all wishlisted IDs once per session
  useEffect(() => {
    if (!session || _wishlistFetched) return;
    _wishlistFetched = true;
    apiFetch("/api/wishlist")
      .then((r) => r.json())
      .then((data) => {
        _wishlistCache = new Set(
          (data.items || []).map(
            (i: { product: { _id: string } }) => i.product._id,
          ),
        );
        _wishlistListeners.forEach((fn) => fn());
      })
      .catch(() => {});
  }, [session]);

  useEffect(() => {
    if (_dbColorsFetched) return;
    _dbColorsFetched = true;
    fetch("/api/colors")
      .then((r) => r.json())
      .then((data) => {
        _dbColorsCache = data;
        setDbColors(data);
      })
      .catch(() => {});
  }, []);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!session) {
      window.location.href = "/login";
      return;
    }
    setWishlistLoading(true);
    try {
      const method = isWishlisted ? "DELETE" : "POST";
      await apiFetch("/api/wishlist", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id }),
      });
      if (isWishlisted) {
        _wishlistCache.delete(product._id);
      } else {
        _wishlistCache.add(product._id);
        setHeartPop(true);
        setTimeout(() => setHeartPop(false), 400);
      }
      _wishlistListeners.forEach((fn) => fn());
    } catch {
      // ignore
    } finally {
      setWishlistLoading(false);
    }
  };

  const submitRating = async (e: React.MouseEvent, stars: number) => {
    e.preventDefault();
    if (!session) {
      window.location.href = "/login";
      return;
    }
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
    setShowRating(false);
  };

  const handleColorClick = (color: string) => {
    setActiveColor(color);
    const match = product.colorImages?.find((ci) => ci.color === color);
    setActiveImage(match?.image ?? product.image);
  };

  const addToCartHandler = () => {
    const existItem = state.cart.cartItems.find((x) => x.slug === product.slug);
    const quantity = existItem ? existItem.quantity + 1 : 1;

    if (product.countInStock < quantity) {
      alert(tc("outOfStock"));
      return;
    }

    dispatch({
      type: "CART_ADD_ITEM",
      payload: {
        name: product.name,
        slug: product.slug,
        image: activeImage,
        price: product.price,
        discountPrice: product.discountPrice,
        countInStock: product.countInStock,
        quantity,
        selectedColor: activeColor ?? undefined,
        sizes: product.sizes ?? [],
        colors: product.colors ?? [],
        parentCategory: product.parentCategory,
      },
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);

    // Fly-to-cart: pure DOM, no React state
    const originEl = imageRef.current;
    const cartEl = document.querySelector<HTMLElement>("[data-cart-icon]");
    if (!originEl || !cartEl) return;

    const originRect = originEl.getBoundingClientRect();
    const cartRect = cartEl.getBoundingClientRect();

    const flyEl = document.createElement("div");
    const size = 64;
    flyEl.style.cssText = `
      position: fixed;
      left: ${originRect.left + originRect.width / 2 - size / 2}px;
      top: ${originRect.top + originRect.height / 2 - size / 2}px;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      overflow: hidden;
      pointer-events: none;
      z-index: 9999;
      border: 2px solid #c9a96e;
      box-shadow: 0 4px 20px rgba(201,169,110,0.4);
      transition: left 0.65s cubic-bezier(0.4,0,0.2,1),
                  top 0.65s cubic-bezier(0.4,0,0.6,1),
                  width 0.65s ease-in,
                  height 0.65s ease-in,
                  opacity 0.25s ease-in 0.4s;
    `;
    const img = document.createElement("img");
    img.src = activeImage || "/images/placeholder.jpg";
    img.style.cssText = "width:100%;height:100%;object-fit:cover;";
    flyEl.appendChild(img);
    document.body.appendChild(flyEl);

    // Trigger animation on next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const endSize = 24;
        flyEl.style.left = `${cartRect.left + cartRect.width / 2 - endSize / 2}px`;
        flyEl.style.top = `${cartRect.top + cartRect.height / 2 - endSize / 2}px`;
        flyEl.style.width = `${endSize}px`;
        flyEl.style.height = `${endSize}px`;
        flyEl.style.opacity = "0";
      });
    });

    setTimeout(() => flyEl.remove(), 800);
  };

  const hasDiscount =
    product.discountPrice > 0 && product.discountPrice < product.price;

  const displayPrice = hasDiscount ? product.discountPrice : product.price;

  return (
    <div
      className="
        group relative flex flex-col overflow-hidden
        bg-gradient-to-b from-[#1c1c1c] to-[#141414]
        border border-white/[0.06]
        shadow-lg
        transition-all duration-300
        hover:-translate-y-2 hover:shadow-2xl
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 relative">
        {/* Star / Rating */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (isCustomer) setShowRating((v) => !v);
            }}
            className={`flex items-center gap-1 ${isCustomer ? "cursor-pointer group/star" : "cursor-default"}`}
          >
            <Star
              className={`w-4 h-4 transition ${avgRating > 0 ? "text-accent fill-accent" : `text-white/25 ${isCustomer ? "group-hover/star:text-accent" : ""}`}`}
            />
            {avgRating > 0 && (
              <span className="text-[10px] text-accent/80 font-bold">
                {avgRating.toFixed(1)}
              </span>
            )}
          </button>

          {/* Rating popup — customers only */}
          {isCustomer && showRating && (
            <div className="absolute top-7 left-0 z-20 bg-[#1c1c1c] border border-white/10 px-3 py-2 flex gap-1 shadow-xl">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={(e) => submitRating(e, star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="cursor-pointer"
                >
                  <Star
                    className={`w-5 h-5 transition ${star <= (hoverRating || avgRating) ? "text-accent fill-accent" : "text-white/20"}`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="font-serif text-[10px] tracking-[0.25em] text-accent/70 uppercase">
          {tc("brand")}
        </span>

        {isCustomer && (
          <button
            type="button"
            onClick={toggleWishlist}
            disabled={wishlistLoading}
            className="cursor-pointer disabled:opacity-50"
          >
            <Heart
              className={`w-4 h-4 transition-all duration-200 ${
                isWishlisted ? "text-accent fill-accent" : "text-white/25 hover:text-accent"
              } ${heartPop ? "scale-150" : "scale-100"}`}
            />
          </button>
        )}
      </div>

      {/* Gold line */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

      {/* Image */}
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-square bg-[#202020] overflow-hidden"
      >
        {product.isFeatured && (
          <span className="absolute top-3 left-3 z-10 bg-accent px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-white shadow">
            {t("newBadge")}
          </span>
        )}

        <div ref={imageRef} className="absolute inset-0">
          <Image
            src={activeImage || "/images/placeholder.jpg"}
            alt={activeColor ? `${product.name} — ${activeColor}` : product.name}
            fill
            unoptimized
            className="object-contain p-8 transition-all duration-500 group-hover:scale-110 group-hover:opacity-95"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-grow px-4 py-4 text-center">
        <Link href={`/product/${product.slug}`} className="flex-grow">
          {/* Title */}
          <h3 className="text-white font-semibold text-sm tracking-wide line-clamp-2 mb-1">
            {product.name}
          </h3>

          <p className="text-white/30 text-xs uppercase tracking-widest mb-3">
            {product.brand}
          </p>

          {/* Price */}
          <div className="mb-3">
            {hasDiscount ? (
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl font-bold text-white">
                  {displayPrice.toLocaleString("en-US")}
                </span>
                <span className="text-xs text-white/40">{tc("currency")}</span>
                <span className="text-xs line-through text-white/25">
                  {product.price.toLocaleString("en-US")}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1">
                <span className="text-xl font-bold text-white">
                  {displayPrice.toLocaleString("en-US")}
                </span>
                <span className="text-xs text-white/40">{tc("currency")}</span>
              </div>
            )}
          </div>
        </Link>

        {/* Colors */}
        {product.colors?.length > 0 && (
          <div className="flex justify-center gap-2 mb-2 flex-wrap">
            {product.colors.slice(0, 5).map((color) => {
              const hex =
                product.colorImages?.find((ci) => ci.color === color)?.hex ||
                dbColors.find((c) => c.name === color)?.hex ||
                COLOR_MAP[color] ||
                "#888";
              const isActive = activeColor === color;
              return (
                <button
                  key={color}
                  type="button"
                  title={color}
                  onClick={() => handleColorClick(color)}
                  className={`
                   cursor-pointer h-5 w-5 rounded-full border transition-all duration-200 shadow-inner
                    ${
                      isActive
                        ? "border-accent scale-125 ring-2 ring-accent/40"
                        : "border-white/15 hover:border-white/40 hover:scale-110"
                    }
                  `}
                  style={{ backgroundColor: hex }}
                />
              );
            })}
          </div>
        )}

        {/* Active color label */}
        {activeColor && (
          <p className="text-[10px] text-accent/70 uppercase tracking-widest mb-2">
            {activeColor}
          </p>
        )}

        {/* Sizes */}
        {product.sizes?.length > 0 && (
          <div className="flex justify-center gap-2 mb-4 flex-wrap">
            {product.sizes.slice(0, 4).map((size) => (
              <span
                key={size}
                className="px-2 py-1 text-[10px] bg-white/5 rounded-md border border-white/10 text-white/50 font-semibold"
              >
                {size}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        {isCustomer && (
          product.parentCategory === "gros" ? (
            <Link
              href={`/product/${product.slug}`}
              className="cursor-pointer w-full py-2 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 bg-accent text-white hover:bg-accent/90 hover:scale-[1.02]"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              {t("configureOrder")}
            </Link>
          ) : (
            <button
              onClick={addToCartHandler}
              className={`cursor-pointer w-full py-2 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-2 ${
                addedToCart
                  ? "bg-green-600 text-white scale-[1.02]"
                  : "bg-accent text-white hover:bg-accent/90 hover:scale-[1.02]"
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              {t("addToCart")}
            </button>
          )
        )}
      </div>
    </div>
  );
}
