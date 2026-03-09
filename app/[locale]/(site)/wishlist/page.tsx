"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/utils/api";
import { useStore } from "@/utils/context/Store";
import { Product } from "@/types";

interface WishlistItem {
  _id: string;
  product: Product;
}

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const tn = useTranslations("nav");
  const tp = useTranslations("products");
  const tc = useTranslations("common");
  const { state, dispatch } = useStore();

  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    apiFetch("/api/wishlist")
      .then((r) => r.json())
      .then((data) => setItems(data.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

  const removeItem = async (productId: string) => {
    await apiFetch("/api/wishlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    setItems((prev) => prev.filter((i) => i.product._id !== productId));
  };

  const addToCart = (product: Product) => {
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
        image: product.image,
        price: product.price,
        discountPrice: product.discountPrice,
        countInStock: product.countInStock,
        quantity,
      },
    });
  };

  if (status === "loading" || loading) {
    return (
      <div
        className="min-h-screen bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: "url('/bgg.webp')" }}
      >
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bgg.webp')" }}
    >
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-10">
        {/* Breadcrumb */}
        <p className="text-white/40 text-xs mb-8">
          <Link href="/" className="hover:text-accent transition-colors">
            {tn("home")}
          </Link>
          <span className="mx-2">&gt;</span>
          <span className="text-white/60">{tn("favorites")}</span>
        </p>

        <div className="flex items-center gap-3 mb-10">
          <Heart className="w-6 h-6 text-accent" />
          <h1 className="font-serif text-4xl md:text-5xl font-bold italic text-white">
            {tn("favorites")}
          </h1>
          {items.length > 0 && (
            <span className="ml-2 bg-accent/20 text-accent text-xs font-black px-3 py-1 border border-accent/30 uppercase tracking-widest">
              {items.length}
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-black/40 border border-white/10 p-16 text-center">
            <Heart className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/40 text-sm font-medium uppercase tracking-widest mb-6">
              Votre liste de favoris est vide
            </p>
            <Link
              href="/products"
              className="inline-block bg-accent text-primary font-black px-8 py-4 uppercase text-xs tracking-[0.3em] hover:bg-accent/80 transition-all"
            >
              {tp("allProducts") || "Explorer la boutique"}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(({ _id, product }) => {
              const hasDiscount =
                product.discountPrice > 0 &&
                product.discountPrice < product.price;
              const displayPrice = hasDiscount
                ? product.discountPrice
                : product.price;

              return (
                <div
                  key={_id}
                  className="bg-black/40 border border-white/10 flex flex-col group"
                >
                  {/* Image */}
                  <Link
                    href={`/product/${product.slug}`}
                    className="relative aspect-square bg-white/5 overflow-hidden"
                  >
                    <Image
                      src={product.image || "/images/placeholder.jpg"}
                      alt={product.name}
                      fill
                      unoptimized
                      className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>

                  {/* Info */}
                  <div className="p-5 flex flex-col flex-grow">
                    <Link href={`/product/${product.slug}`}>
                      <h3 className="text-white font-semibold text-sm leading-tight mb-1 hover:text-accent transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-white/30 text-xs uppercase tracking-widest mb-3">
                      {product.brand}
                    </p>

                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-xl font-bold text-white">
                        {displayPrice.toLocaleString("en-US")}
                      </span>
                      <span className="text-xs text-white/40">
                        {tc("currency")}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs line-through text-white/25">
                          {product.price.toLocaleString("en-US")}
                        </span>
                      )}
                    </div>

                    <div className="mt-auto flex gap-2">
                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.countInStock === 0}
                        className="flex-1 flex items-center justify-center gap-2 bg-accent text-primary py-2.5 text-xs font-black uppercase tracking-widest hover:bg-accent/80 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ShoppingBag size={14} />
                        {tp("addToCart")}
                      </button>
                      <button
                        onClick={() => removeItem(product._id)}
                        className="p-2.5 border border-white/10 text-white/40 hover:border-red-500/50 hover:text-red-400 transition-all cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
