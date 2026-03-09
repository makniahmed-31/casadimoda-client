"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/routing";
import { useStore } from "@/utils/context/Store";
import { CartItem, CartVariation } from "@/types";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { apiFetch } from "@/utils/api";

export default function CartPage() {
  const t = useTranslations("checkout");
  const { state, dispatch } = useStore();
  const {
    cart: { cartItems },
  } = state;
  const { data: session } = useSession();
  const router = useRouter();

  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState<{ code: string; discountAmount: number } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);

  const [giftCardCode, setGiftCardCode] = useState("");
  const [giftCardApplied, setGiftCardApplied] = useState<{ code: string; balance: number; discountAmount: number } | null>(null);
  const [giftCardError, setGiftCardError] = useState("");
  const [giftCardLoading, setGiftCardLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const paymentMethod = "delivery";
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [attempted, setAttempted] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateCartItem = (item: CartItem, updates: Partial<CartItem>) => {
    dispatch({ type: "CART_ADD_ITEM", payload: { ...item, ...updates } });
  };

  const removeItemHandler = (item: CartItem) =>
    dispatch({ type: "CART_REMOVE_ITEM", payload: item });

  // Wholesale: update a variation row
  const updateVariation = (item: CartItem, i: number, field: keyof CartVariation, value: string | number) => {
    const updated = (item.variations ?? []).map((v, j) =>
      j === i ? { ...v, [field]: value } : v
    );
    const totalQty = updated.reduce((s, v) => s + v.quantity, 0);
    updateCartItem(item, { variations: updated, quantity: totalQty });
  };

  const addVariationRow = (item: CartItem) => {
    const newVar: CartVariation = {
      color: item.colors?.[0] ?? "",
      size: item.sizes?.[0] ?? "",
      quantity: 1,
    };
    const updated = [...(item.variations ?? []), newVar];
    const totalQty = updated.reduce((s, v) => s + v.quantity, 0);
    updateCartItem(item, { variations: updated, quantity: totalQty });
  };

  const removeVariationRow = (item: CartItem, i: number) => {
    const updated = (item.variations ?? []).filter((_, j) => j !== i);
    const totalQty = updated.reduce((s, v) => s + v.quantity, 0);
    updateCartItem(item, { variations: updated, quantity: totalQty });
  };

  const startAdjusting = useCallback(
    (item: CartItem, direction: "up" | "down") => {
      const adjust = () => {
        const newQty =
          direction === "up" ? item.quantity + 1 : item.quantity - 1;
        if (newQty >= 1 && newQty <= item.countInStock) {
          dispatch({ type: "CART_ADD_ITEM", payload: { ...item, quantity: newQty } });
        }
      };
      adjust();
      timerRef.current = setTimeout(() => {
        intervalRef.current = setInterval(adjust, 100);
      }, 500);
    },
    [dispatch],
  );
  const stopAdjusting = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);
  useEffect(() => () => stopAdjusting(), [stopAdjusting]);

  // Pre-fill name from session
  useEffect(() => {
    if (session?.user?.name) setFullName(session.user.name);
  }, [session]);

  const subtotal = cartItems.reduce(
    (a, c) => a + (c.quantity || 0) * (c.discountPrice || c.price || 0),
    0,
  );
  const originalTotal = cartItems.reduce(
    (a, c) => a + (c.quantity || 0) * (c.price || 0),
    0,
  );
  const totalDiscount = originalTotal - subtotal;
  const promoDiscount = promoApplied?.discountAmount ?? 0;
  const giftCardDiscount = giftCardApplied?.discountAmount ?? 0;
  const finalTotal = subtotal - promoDiscount - giftCardDiscount;

  const applyGiftCard = async () => {
    if (!giftCardCode.trim()) return;
    setGiftCardError("");
    setGiftCardLoading(true);
    try {
      const res = await apiFetch("/api/giftcard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: giftCardCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGiftCardError(data.message || "Invalid gift card");
        setGiftCardApplied(null);
      } else {
        const afterPromo = subtotal - promoDiscount;
        const discountAmount = Math.min(data.balance, afterPromo);
        setGiftCardApplied({ code: data.code, balance: data.balance, discountAmount });
      }
    } catch {
      setGiftCardError("Error applying gift card");
    } finally {
      setGiftCardLoading(false);
    }
  };

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoError("");
    setPromoLoading(true);
    try {
      const res = await apiFetch("/api/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode.trim(), subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPromoError(data.message || "Invalid coupon");
        setPromoApplied(null);
      } else {
        setPromoApplied({ code: data.code, discountAmount: data.discountAmount });
      }
    } catch {
      setPromoError("Error applying coupon");
    } finally {
      setPromoLoading(false);
    }
  };

  // Validate color/size are selected for all items that need them
  const getSelectionErrors = () => {
    const errors: string[] = [];
    for (const item of cartItems) {
      if (item.parentCategory === "gros") {
        const vars = item.variations ?? [];
        if (vars.length === 0) {
          errors.push(`${item.name}: aucune variante configurée`);
        } else {
          for (const v of vars) {
            if (item.colors?.length && !v.color) errors.push(`${item.name}: couleur manquante`);
            if (item.sizes?.length && !v.size) errors.push(`${item.name}: taille manquante`);
            if (v.quantity < 1) errors.push(`${item.name}: quantité invalide`);
          }
        }
      } else {
        if (item.colors?.length && !item.selectedColor)
          errors.push(`${item.name}: couleur non sélectionnée`);
        if (item.sizes?.length && !item.selectedSize)
          errors.push(`${item.name}: taille non sélectionnée`);
      }
    }
    return errors;
  };

  if (cartItems.length === 0) {
    return (
      <div
        className="min-h-[calc(100dvh-var(--header-height,80px))] bg-cover bg-center flex flex-col items-center justify-center text-center px-4"
        style={{ backgroundImage: "url('/bgg.webp')" }}
      >
        <div className="w-20 h-20 border border-white/10 bg-white/5 flex items-center justify-center mb-6">
          <ShoppingBag className="w-8 h-8 text-accent/40" />
        </div>
        <h1 className="font-serif text-4xl font-bold italic text-white mb-4">
          {t("emptyCart")}
        </h1>
        <Link
          href="/"
          className="bg-accent text-primary px-10 py-4 font-black uppercase text-xs tracking-[0.2em] hover:bg-accent/80 transition-all mt-4"
        >
          {t("exploreCollection")}
        </Link>
      </div>
    );
  }

  const selectionErrors = attempted ? getSelectionErrors() : [];

  return (
    <div
      className="min-h-[calc(100dvh-var(--header-height,80px))] bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bgg.webp')" }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-10">
        <h1 className="font-serif text-5xl md:text-6xl font-bold italic text-white mb-10">
          {t("title")}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT — Items */}
          <div className="lg:col-span-7 space-y-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
              {t("orderSummary")}
            </p>

            <div className="space-y-4">
              {cartItems.map((item) => {
                const isWholesale = item.parentCategory === "gros";
                const unitPrice = item.discountPrice || item.price;

                return (
                  <div
                    key={item.slug}
                    className="bg-black/30 border border-white/10 p-4"
                  >
                    <div className="flex gap-4">
                      <Link
                        href={`/product/${item.slug}`}
                        className="relative w-16 h-20 shrink-0 overflow-hidden bg-white/10"
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </Link>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-xs font-black text-white/50 uppercase tracking-widest">
                              {item.name}
                            </p>
                            <p className="text-sm font-black text-white mt-0.5">
                              CASA DI MODA
                            </p>
                            {isWholesale && (
                              <span className="text-[9px] font-black text-accent/70 uppercase tracking-widest">
                                Gros · {unitPrice.toLocaleString()} TND/unité
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => removeItemHandler(item)}
                            className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            {t("remove")}
                          </button>
                        </div>

                        {/* ── WHOLESALE: variation table ── */}
                        {isWholesale ? (
                          <div className="space-y-2">
                            {(item.variations ?? []).map((v, i) => (
                              <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 p-2">
                                {(item.colors?.length ?? 0) > 0 && (
                                  <select
                                    value={v.color}
                                    onChange={(e) => updateVariation(item, i, "color", e.target.value)}
                                    className="flex-1 bg-white/10 border border-white/20 text-white text-xs p-1.5 outline-none focus:border-accent"
                                  >
                                    <option value="">Couleur</option>
                                    {item.colors!.map((c) => (
                                      <option key={c} value={c} className="text-black">{c}</option>
                                    ))}
                                  </select>
                                )}
                                {(item.sizes?.length ?? 0) > 0 && (
                                  <select
                                    value={v.size}
                                    onChange={(e) => updateVariation(item, i, "size", e.target.value)}
                                    className="flex-1 bg-white/10 border border-white/20 text-white text-xs p-1.5 outline-none focus:border-accent"
                                  >
                                    <option value="">Taille</option>
                                    {item.sizes!.map((s) => (
                                      <option key={s} value={s} className="text-black">{s}</option>
                                    ))}
                                  </select>
                                )}
                                <div className="flex items-center border border-white/20 bg-white/5">
                                  <button
                                    onClick={() => updateVariation(item, i, "quantity", Math.max(1, v.quantity - 1))}
                                    className="px-2 py-1 text-white/60 hover:text-accent cursor-pointer"
                                  >
                                    <Minus size={10} />
                                  </button>
                                  <span className="text-xs font-black text-white min-w-[1.5rem] text-center">
                                    {v.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateVariation(item, i, "quantity", v.quantity + 1)}
                                    className="px-2 py-1 text-white/60 hover:text-accent cursor-pointer"
                                  >
                                    <Plus size={10} />
                                  </button>
                                </div>
                                <span className="text-xs font-black text-accent min-w-[4rem] text-right">
                                  {(v.quantity * unitPrice).toLocaleString()} TND
                                </span>
                                {(item.variations?.length ?? 0) > 1 && (
                                  <button
                                    onClick={() => removeVariationRow(item, i)}
                                    className="text-white/30 hover:text-red-400 cursor-pointer"
                                  >
                                    <X size={12} />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              onClick={() => addVariationRow(item)}
                              className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-accent hover:text-accent/70 cursor-pointer mt-1"
                            >
                              <Plus size={11} /> Ajouter une variante
                            </button>
                            <p className="text-xs font-black text-white/50 mt-1">
                              Total: {item.quantity} unités · {(item.quantity * unitPrice).toLocaleString()} TND
                            </p>
                          </div>
                        ) : (
                          /* ── RETAIL: color/size selectors + qty ── */
                          <div className="space-y-2">
                            <div className="flex gap-2 flex-wrap">
                              {(item.colors?.length ?? 0) > 0 && (
                                <div className="flex-1 min-w-[120px]">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">
                                    Couleur <span className="text-red-400">*</span>
                                  </p>
                                  <select
                                    value={item.selectedColor ?? ""}
                                    onChange={(e) =>
                                      updateCartItem(item, { selectedColor: e.target.value })
                                    }
                                    className={`w-full bg-white/5 border text-white text-xs p-2 outline-none transition-all ${
                                      attempted && !item.selectedColor
                                        ? "border-red-500"
                                        : "border-white/20 focus:border-accent"
                                    }`}
                                  >
                                    <option value="" className="text-black">— Choisir —</option>
                                    {item.colors!.map((c) => (
                                      <option key={c} value={c} className="text-black">{c}</option>
                                    ))}
                                  </select>
                                </div>
                              )}
                              {(item.sizes?.length ?? 0) > 0 && (
                                <div className="flex-1 min-w-[120px]">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">
                                    Taille <span className="text-red-400">*</span>
                                  </p>
                                  <select
                                    value={item.selectedSize ?? ""}
                                    onChange={(e) =>
                                      updateCartItem(item, { selectedSize: e.target.value })
                                    }
                                    className={`w-full bg-white/5 border text-white text-xs p-2 outline-none transition-all ${
                                      attempted && !item.selectedSize
                                        ? "border-red-500"
                                        : "border-white/20 focus:border-accent"
                                    }`}
                                  >
                                    <option value="" className="text-black">— Choisir —</option>
                                    {item.sizes!.map((s) => (
                                      <option key={s} value={s} className="text-black">{s}</option>
                                    ))}
                                  </select>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center border border-white/10 bg-white/5">
                                <button
                                  onMouseDown={() => startAdjusting(item, "down")}
                                  onMouseUp={stopAdjusting}
                                  onMouseLeave={stopAdjusting}
                                  onTouchStart={() => startAdjusting(item, "down")}
                                  onTouchEnd={stopAdjusting}
                                  disabled={item.quantity <= 1}
                                  className="px-3 py-1.5 text-white/60 hover:text-accent disabled:opacity-20 cursor-pointer transition-colors"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="text-xs font-black text-white min-w-[2rem] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onMouseDown={() => startAdjusting(item, "up")}
                                  onMouseUp={stopAdjusting}
                                  onMouseLeave={stopAdjusting}
                                  onTouchStart={() => startAdjusting(item, "up")}
                                  onTouchEnd={stopAdjusting}
                                  disabled={item.quantity >= item.countInStock}
                                  className="px-3 py-1.5 text-white/60 hover:text-accent disabled:opacity-20 cursor-pointer transition-colors"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                              <span className="text-sm font-black text-accent">
                                {(item.quantity * unitPrice).toLocaleString()} TND
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selection errors */}
            {selectionErrors.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 p-3 space-y-1">
                {selectionErrors.map((e, i) => (
                  <p key={i} className="text-red-400 text-[10px] font-bold uppercase tracking-widest">
                    ⚠ {e}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — Summary + Payment + Validate */}
          <div className="lg:col-span-5">
            {/* Delivery Info */}
            <div className="bg-black/30 border border-white/10 p-5 space-y-3 mb-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">
                  {t("fullName")} <span className="text-red-500">*</span>
                </p>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t("fullNamePlaceholder")}
                  className={`w-full bg-white/5 border py-3 px-4 text-sm text-white placeholder:text-white/20 outline-none transition-all ${attempted && !fullName ? "border-red-500" : "border-white/10 focus:border-accent"}`}
                />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">
                  {t("deliveryAddress")} <span className="text-red-500">*</span>
                </p>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t("addressPlaceholder")}
                  rows={2}
                  className={`w-full bg-white/5 border py-3 px-4 text-sm text-white placeholder:text-white/20 outline-none transition-all resize-none ${attempted && !address ? "border-red-500" : "border-white/10 focus:border-accent"}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">
                    {t("city")} <span className="text-red-500">*</span>
                  </p>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={t("cityPlaceholder")}
                    className={`w-full bg-white/5 border py-3 px-4 text-sm text-white placeholder:text-white/20 outline-none transition-all ${attempted && !city ? "border-red-500" : "border-white/10 focus:border-accent"}`}
                  />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">
                    {t("postalCode")} <span className="text-red-500">*</span>
                  </p>
                  <input
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder={t("postalCodePlaceholder")}
                    className={`w-full bg-white/5 border py-3 px-4 text-sm text-white placeholder:text-white/20 outline-none transition-all ${attempted && !postalCode ? "border-red-500" : "border-white/10 focus:border-accent"}`}
                  />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">
                  {t("country")} <span className="text-red-500">*</span>
                </p>
                <input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder={t("countryPlaceholder")}
                  className={`w-full bg-white/5 border py-3 px-4 text-sm text-white placeholder:text-white/20 outline-none transition-all ${attempted && !country ? "border-red-500" : "border-white/10 focus:border-accent"}`}
                />
              </div>
            </div>

            <div className="sticky top-8 bg-black/50 border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/50">
                  {t("viewSummary")}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">{t("subtotal")}</span>
                  <span className="text-white font-bold">
                    {originalTotal.toLocaleString()} {t("currency")}
                  </span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">{t("diamonds")}</span>
                    <span className="text-accent font-bold">
                      -{totalDiscount.toLocaleString()} {t("currency")}
                    </span>
                  </div>
                )}
                {promoApplied && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-400 font-bold text-xs uppercase tracking-widest">
                      {promoApplied.code}
                    </span>
                    <span className="text-green-400 font-bold">
                      -{promoApplied.discountAmount.toLocaleString()} {t("currency")}
                    </span>
                  </div>
                )}
                {giftCardApplied && (
                  <div className="flex justify-between text-sm">
                    <span className="text-yellow-400 font-bold text-xs uppercase tracking-widest">
                      🎁 {giftCardApplied.code}
                    </span>
                    <span className="text-yellow-400 font-bold">
                      -{giftCardApplied.discountAmount.toLocaleString()} {t("currency")}
                    </span>
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 pt-5 mb-6">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    {t("total")}
                  </span>
                  <div className="text-right">
                    <span className="text-4xl font-black text-white">
                      {finalTotal.toLocaleString()}
                    </span>
                    <span className="text-lg font-bold text-white/40 ml-1">
                      {t("currency")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">{t("promoCode")}</p>
                {promoApplied ? (
                  <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 px-3 py-2">
                    <span className="text-xs font-bold text-green-400 uppercase tracking-widest">{promoApplied.code} ✓</span>
                    <button
                      onClick={() => { setPromoApplied(null); setPromoCode(""); }}
                      className="text-[10px] text-white/30 hover:text-red-400 cursor-pointer uppercase tracking-widest"
                    >
                      {t("remove")}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        value={promoCode}
                        onChange={(e) => { setPromoCode(e.target.value); setPromoError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && applyPromo()}
                        placeholder={t("promoPlaceholder")}
                        className="flex-1 bg-white/5 border border-white/10 focus:border-accent py-2.5 px-3 text-sm text-white placeholder:text-white/20 outline-none transition-all"
                      />
                      <button
                        onClick={applyPromo}
                        disabled={promoLoading}
                        className="bg-accent hover:bg-accent/80 disabled:opacity-50 text-primary font-black px-4 text-[10px] tracking-widest uppercase transition-all cursor-pointer"
                      >
                        {promoLoading ? "..." : t("apply")}
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-red-400 text-[10px] font-bold mt-1">{promoError}</p>
                    )}
                  </>
                )}
              </div>

              {/* Gift Card */}
              <div className="mb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Gift Card</p>
                {giftCardApplied ? (
                  <div className="flex items-center justify-between bg-yellow-500/10 border border-yellow-500/30 px-3 py-2">
                    <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">🎁 {giftCardApplied.code} ✓</span>
                    <button
                      onClick={() => { setGiftCardApplied(null); setGiftCardCode(""); }}
                      className="text-[10px] text-white/30 hover:text-red-400 cursor-pointer uppercase tracking-widest"
                    >
                      {t("remove")}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        value={giftCardCode}
                        onChange={(e) => { setGiftCardCode(e.target.value); setGiftCardError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && applyGiftCard()}
                        placeholder="CM-XXXXXXXX"
                        className="flex-1 bg-white/5 border border-white/10 focus:border-yellow-400 py-2.5 px-3 text-sm text-white placeholder:text-white/20 outline-none transition-all"
                      />
                      <button
                        onClick={applyGiftCard}
                        disabled={giftCardLoading}
                        className="bg-yellow-500/80 hover:bg-yellow-400 disabled:opacity-50 text-primary font-black px-4 text-[10px] tracking-widest uppercase transition-all cursor-pointer"
                      >
                        {giftCardLoading ? "..." : t("apply")}
                      </button>
                    </div>
                    {giftCardError && (
                      <p className="text-red-400 text-[10px] font-bold mt-1">{giftCardError}</p>
                    )}
                  </>
                )}
              </div>

              {/* Payment method — delivery only */}
              <div className="flex items-center gap-2 mb-6 p-3 border border-accent/20 bg-accent/5">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-xs font-bold text-accent/80 uppercase tracking-widest">
                  {t("paymentOnDelivery")}
                </span>
              </div>

              {error && (
                <p className="text-red-400 text-xs font-bold text-center mb-2">
                  {error}
                </p>
              )}

              <button
                disabled={submitting}
                onClick={async () => {
                  setAttempted(true);
                  if (!session) {
                    router.push("/login");
                    return;
                  }
                  if (!fullName || !address || !city || !postalCode || !country) {
                    setError(t("fillAllFields"));
                    return;
                  }
                  const errs = getSelectionErrors();
                  if (errs.length > 0) {
                    setError("Veuillez sélectionner couleur et taille pour chaque article");
                    return;
                  }
                  setError("");
                  setSubmitting(true);
                  try {
                    // Expand cart items into order items (wholesale → multiple rows)
                    const orderItems = cartItems.flatMap((item) => {
                      const unitPrice = item.discountPrice || item.price;
                      if (item.parentCategory === "gros" && item.variations?.length) {
                        return item.variations.map((v) => ({
                          name: item.name,
                          quantity: v.quantity,
                          image: item.image,
                          price: unitPrice,
                          color: v.color,
                          size: v.size,
                        }));
                      }
                      return [{
                        name: item.name,
                        quantity: item.quantity,
                        image: item.image,
                        price: unitPrice,
                        color: item.selectedColor,
                        size: item.selectedSize,
                      }];
                    });

                    const res = await apiFetch("/api/user/orders", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        orderItems,
                        shippingAddress: { fullName, address, city, postalCode, country },
                        paymentMethod,
                        couponCode: promoApplied?.code,
                        giftCardCode: giftCardApplied?.code,
                        itemsPrice: subtotal,
                        totalPrice: finalTotal,
                      }),
                    });
                    if (!res.ok) {
                      const d = await res.json();
                      setError(d.message || "Error");
                      return;
                    }
                    dispatch({ type: "CART_RESET" });
                    router.push("/orders");
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="w-full bg-accent hover:bg-accent/80 disabled:opacity-60 disabled:cursor-not-allowed text-primary font-black py-4 uppercase text-xs tracking-[0.3em] transition-all active:scale-[0.98] cursor-pointer shadow-lg"
              >
                {submitting ? t("submitting") : t("validateOrder")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
