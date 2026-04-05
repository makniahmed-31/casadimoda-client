"use client";

import { CartVariation, Product } from "@/types";
import { apiFetch } from "@/utils/api";
import { useStore } from "@/utils/context/Store";
import { ChevronLeft, ChevronRight, Heart, Plus, Star, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
  product: Product;
  displayPrice: number;
  hasDiscount: boolean;
  onColorSelect: (image: string) => void;
}

export default function ProductPurchase({ product, displayPrice, hasDiscount, onColorSelect }: Props) {
  const t = useTranslations("product");
  const tp = useTranslations("products");
  const { data: session } = useSession();
  const isCustomer = !session || session.user.role === "customer";
  const { state, dispatch } = useStore();

  const isWholesale = product.parentCategory === "gros";
  const hasSizes = product.sizes && product.sizes.length > 0;
  const hasColors = product.colors && product.colors.length > 0;

  const [qty, setQty] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectionError, setSelectionError] = useState("");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [dbColors, setDbColors] = useState<{ name: string; hex: string }[]>([]);
  const [avgRating, setAvgRating] = useState(product.rating || 0);
  const [numReviews, setNumReviews] = useState(product.numReviews || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [variations, setVariations] = useState<CartVariation[]>([
    { color: product.colors?.[0] ?? "", size: product.sizes?.[0] ?? "", quantity: 1 },
  ]);

  useEffect(() => {
    apiFetch("/api/colors")
      .then((r) => r.json())
      .then(setDbColors)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!session || !product._id) return;
    apiFetch(`/api/wishlist?productId=${product._id}`)
      .then((r) => r.json())
      .then((d) => setIsWishlisted(d.isWishlisted))
      .catch(() => {});
  }, [session, product._id]);

  useEffect(() => {
    if (!session || !product._id) return;
    apiFetch(`/api/reviews?productId=${product._id}`)
      .then((r) => r.json())
      .then((d) => {
        const mine = d.reviews?.find(
          (r: { user: { email?: string }; rating: number }) => r.user?.email === session.user?.email
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
      const d = await res.json();
      setAvgRating(d.rating);
      setNumReviews(d.numReviews);
    }
  };

  const toggleWishlist = async () => {
    if (!session) {
      window.location.href = "/login";
      return;
    }
    setWishlistLoading(true);
    try {
      const res = await apiFetch("/api/wishlist", {
        method: isWishlisted ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id }),
      });
      const d = await res.json();
      setIsWishlisted(d.isWishlisted);
    } finally {
      setWishlistLoading(false);
    }
  };

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startAdjusting = useCallback(
    (direction: "up" | "down") => {
      const adjust = () =>
        setQty((p) => (direction === "up" ? Math.min(product.countInStock, p + 1) : Math.max(1, p - 1)));
      adjust();
      timerRef.current = setTimeout(() => {
        intervalRef.current = setInterval(adjust, 100);
      }, 500);
    },
    [product.countInStock]
  );
  const stopAdjusting = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);
  useEffect(() => () => stopAdjusting(), [stopAdjusting]);

  const addToCartHandler = () => {
    if (isWholesale) {
      const invalid = variations.some((v) => (hasColors && !v.color) || (hasSizes && !v.size) || v.quantity < 1);
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

  const wholesaleTotal = isWholesale ? variations.reduce((s, v) => s + v.quantity * displayPrice, 0) : 0;

  return (
    <>
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
                className={`w-4 h-4 transition-colors ${star <= (hoverRating || userRating || avgRating) ? "text-accent fill-accent" : "text-primary/20"}`}
              />
            </button>
          ))}
        </div>
        <span className="text-[10px] text-primary/40 font-medium">
          {avgRating > 0 ? `${avgRating.toFixed(1)} · ${numReviews} avis` : "Aucun avis"}
        </span>
      </div>

      {/* Wholesale variation builder */}
      {isWholesale ? (
        <div className="mb-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-3">
            Configurer les quantités par couleur / taille
          </p>
          <div className="space-y-2">
            {variations.map((v, i) => (
              <div key={i} className="flex items-center gap-2 bg-primary/5 border border-gray-200 p-2">
                {hasColors && (
                  <select
                    value={v.color}
                    onChange={(e) => {
                      const color = e.target.value;
                      setVariations((vs) => vs.map((r, j) => (j === i ? { ...r, color } : r)));
                      setSelectionError("");
                      const colorImg = product.colorImages?.find((ci) => ci.color === color);
                      onColorSelect(colorImg?.image || product.image);
                    }}
                    className="flex-1 border border-gray-200 p-2 text-xs text-primary bg-white outline-none focus:border-accent"
                  >
                    <option value="">Couleur</option>
                    {product.colors.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )}
                {hasSizes && (
                  <select
                    value={v.size}
                    onChange={(e) => {
                      setVariations((vs) => vs.map((r, j) => (j === i ? { ...r, size: e.target.value } : r)));
                      setSelectionError("");
                    }}
                    className="flex-1 border border-gray-200 p-2 text-xs text-primary bg-white outline-none focus:border-accent"
                  >
                    <option value="">Taille</option>
                    {product.sizes.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                )}
                <input
                  type="number"
                  min={1}
                  max={product.countInStock}
                  value={v.quantity}
                  onChange={(e) =>
                    setVariations((vs) =>
                      vs.map((r, j) => (j === i ? { ...r, quantity: Math.max(1, parseInt(e.target.value) || 1) } : r))
                    )
                  }
                  className="w-16 border border-gray-200 p-2 text-xs text-primary text-center bg-white outline-none focus:border-accent"
                />
                <span className="text-[10px] text-primary/40 font-bold w-20 text-right">
                  {(v.quantity * displayPrice).toLocaleString()} TND
                </span>
                {variations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setVariations((vs) => vs.filter((_, j) => j !== i))}
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
            onClick={() => {
              setVariations((v) => [
                ...v,
                { color: product.colors?.[0] ?? "", size: product.sizes?.[0] ?? "", quantity: 1 },
              ]);
              setSelectionError("");
            }}
            className="mt-2 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-accent hover:text-accent/70 cursor-pointer transition-colors"
          >
            <Plus size={12} /> Ajouter une variante
          </button>
          <div className="mt-3 flex justify-between items-center border-t border-gray-200 pt-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">
              Total ({variations.reduce((s, v) => s + v.quantity, 0)} unités)
            </span>
            <span className="text-lg font-black text-primary">{wholesaleTotal.toLocaleString()} TND</span>
          </div>
        </div>
      ) : (
        <>
          {/* Color selector */}
          {hasColors && (
            <div className="mb-4 md:mb-5">
              <p className="text-[9px] md:text-[11px] font-bold text-primary/40 uppercase tracking-widest mb-2">
                {t("colorLabel")} :{" "}
                {selectedColor && <span className="text-primary/70 font-bold">{selectedColor}</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => {
                  const colorImg = product.colorImages?.find((ci) => ci.color === color);
                  const hex = colorImg?.hex || dbColors.find((c) => c.name === color)?.hex || "#888";
                  const isLight =
                    ["#ffffff", "#f5f5f5", "#e5e7eb", "#d1d5db"].includes(hex) ||
                    ["Blanc", "Blanc Total", "Blanc / Gris", "Gris Chiné"].includes(color);
                  return (
                    <button
                      key={color}
                      title={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setSelectionError("");
                        onColorSelect(colorImg?.image || product.image);
                      }}
                      className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${selectedColor === color ? "border-accent scale-110 shadow-md" : isLight ? "border-gray-300 hover:border-accent" : "border-transparent hover:border-accent"}`}
                      style={{ backgroundColor: hex }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Size selector */}
          {hasSizes && (
            <div className="mb-4 md:mb-5">
              <p className="text-[9px] md:text-[11px] font-bold text-primary/40 uppercase tracking-widest mb-2">
                {t("sizeLabel")} : {selectedSize && <span className="text-primary/70 font-bold">{selectedSize}</span>}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(size);
                      setSelectionError("");
                    }}
                    className={`min-w-[2.25rem] h-9 px-2.5 border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${selectedSize === size ? "border-primary bg-primary text-white" : "border-gray-200 text-primary hover:border-primary"}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
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
                disabled={qty <= 1}
                className="w-9 h-9 md:w-10 md:h-10 border border-gray-200 flex items-center justify-center hover:border-primary transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
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
                disabled={qty >= product.countInStock}
                className="w-9 h-9 md:w-10 md:h-10 border border-gray-200 flex items-center justify-center hover:border-primary transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={() => setQty(Math.min(product.countInStock, qty + 10))}
                disabled={qty >= product.countInStock}
                className="ml-2 text-[9px] md:text-[10px] font-bold text-accent border border-accent/30 px-2.5 py-2 hover:bg-accent hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
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

      {selectionError && (
        <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-3 -mt-1">⚠ {selectionError}</p>
      )}

      {isCustomer && (
        <>
          <button
            onClick={addToCartHandler}
            disabled={product.countInStock === 0}
            className={`w-full py-3 md:py-3.5 font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs transition-all cursor-pointer mb-2 ${isAdded ? "bg-green-700 text-white" : "bg-primary text-white hover:bg-accent"} disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed`}
          >
            {isAdded ? t("addedToCart") : tp("addToCart")}
          </button>
          <button
            onClick={toggleWishlist}
            disabled={wishlistLoading}
            className={`w-full py-2.5 md:py-3 border text-[10px] md:text-xs font-medium uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 mb-5 md:mb-8 disabled:opacity-50 disabled:cursor-not-allowed ${isWishlisted ? "border-accent bg-accent/10 text-accent" : "border-gray-200 hover:border-primary text-primary/60 hover:text-primary"}`}
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-accent" : ""}`} />
            {isWishlisted ? t("removeFromWishlist") : t("addToWishlist")}
          </button>
        </>
      )}
    </>
  );
}
