"use client";

import { useState } from "react";
import { Plus, Ticket, ArrowDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";

import { Coupon } from "@/types";
import { apiFetch } from "@/utils/api";

type CouponInput = {
  code: string;
  type: "percentage" | "fixed";
  discount: number;
  expiryDate?: string;
  maxUsage?: number | null;
};

export default function CouponsList({
  initialCoupons,
}: {
  initialCoupons: Coupon[];
}) {
  const t = useTranslations("admin");
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [showModal, setShowModal] = useState(false);

  const { register, handleSubmit, reset } = useForm<CouponInput>();

  const fetchCoupons = async () => {
    const res = await apiFetch("/api/admin/coupons");
    const data = await res.json();
    setCoupons(data);
  };

  const terminateCoupon = async (id: string) => {
    if (!confirm(t("terminate") + "?")) return;
    await apiFetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
    fetchCoupons();
  };

  const onSubmit = async (data: CouponInput) => {
    const payload = {
      ...data,
      code: data.code.trim().toUpperCase(),
      maxUsage: data.maxUsage ? Number(data.maxUsage) : null,
      expiryDate: data.expiryDate || undefined,
    };
    await apiFetch("/api/admin/coupons", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
    reset();
    setShowModal(false);
    fetchCoupons();
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-secondary tracking-tighter lowercase">
            {t("couponsTitle")}
            <span className="text-accent text-5xl">.</span>
          </h1>
          <p className="text-text-dark/40 font-bold uppercase tracking-widest text-[10px] mt-2">
            {t("couponsSubtitle")}
          </p>
        </div>
        <button
          onClick={() => {
            reset();
            setShowModal(true);
          }}
          className="bg-primary hover:bg-black text-white px-8 py-4 font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <Plus size={16} /> {t("newCampaign")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {coupons.map((coupon) => (
          <div
            key={coupon._id}
            className="bg-white p-6 border border-dashed border-gray-200 hover:border-accent transition-all duration-500 relative group overflow-hidden"
          >
            <div className="absolute top-4 right-4 text-accent/20 group-hover:text-accent transition-colors">
              <Ticket size={48} strokeWidth={1} />
            </div>
            <div className="mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-accent bg-accent/5 px-3 py-1 rounded-full">
                {coupon.type === "percentage" ? t("reduction") : t("flatRate")}
              </span>
            </div>
            <h3 className="text-2xl font-black text-primary font-mono mb-1">
              {coupon.code}
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <ArrowDown size={14} className="text-red-500" />
              <span className="text-lg font-black text-primary">
                {coupon.type === "percentage"
                  ? `${coupon.discount}% OFF`
                  : `${coupon.discount} TND OFF`}
              </span>
            </div>
            <div className="space-y-1 mb-4">
              {coupon.expiryDate && (
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Expire: {new Date(coupon.expiryDate).toLocaleDateString("fr-TN")}
                </p>
              )}
              {coupon.maxUsage != null && (
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Usage: {coupon.usageCount ?? 0} / {coupon.maxUsage}
                </p>
              )}
              {coupon.maxUsage == null && (
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Usage: {coupon.usageCount ?? 0} / ∞
                </p>
              )}
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <span
                className={`text-[9px] font-black uppercase tracking-widest ${
                  coupon.isActive ? "text-green-500" : "text-gray-300"
                }`}
              >
                {coupon.isActive ? t("liveNow") : t("inactive")}
              </span>
              <button
                onClick={() => terminateCoupon(coupon._id)}
                className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-accent transition-colors cursor-pointer"
              >
                {t("terminate")}
              </button>
            </div>
          </div>
        ))}
        {coupons.length === 0 && (
          <div className="col-span-full py-20 bg-secondary/20 border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-4 text-center p-10">
            <Ticket size={64} className="text-gray-100" />
            <p className="max-w-xs text-xs font-bold text-text-dark/30 uppercase tracking-[0.2em] leading-relaxed">
              {t("noCoupons")}
            </p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg p-10 shadow-2xl animate-in zoom-in duration-300">
            <h2 className="text-2xl font-black text-primary mb-8 tracking-tight italic">
              {t("initiateCoupon")}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-dark/30 ml-2">
                  {t("promotionCode")}
                </label>
                <input
                  {...register("code", { required: true })}
                  className="w-full bg-secondary border-none p-4 outline-none font-black text-primary uppercase placeholder:lowercase"
                  placeholder={t("couponCodePlaceholder")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-dark/30 ml-2">
                    {t("couponModel")}
                  </label>
                  <select
                    {...register("type")}
                    className="w-full bg-secondary border-none p-4 outline-none font-bold text-primary appearance-none cursor-pointer"
                  >
                    <option value="percentage">{t("percentageType")}</option>
                    <option value="fixed">{t("fixedType")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-dark/30 ml-2">
                    {t("benefitValue")}
                  </label>
                  <input
                    type="number"
                    {...register("discount", {
                      required: true,
                      valueAsNumber: true,
                    })}
                    className="w-full bg-secondary border-none p-4 outline-none font-bold text-primary"
                    placeholder={t("discountValuePlaceholder")}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-dark/30 ml-2">
                    Expiry Date (optional)
                  </label>
                  <input
                    type="date"
                    {...register("expiryDate")}
                    className="w-full bg-secondary border-none p-4 outline-none font-bold text-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-dark/30 ml-2">
                    Max Usage (optional)
                  </label>
                  <input
                    type="number"
                    min={1}
                    {...register("maxUsage", { valueAsNumber: true })}
                    className="w-full bg-secondary border-none p-4 outline-none font-bold text-primary"
                    placeholder="∞ unlimited"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 text-primary font-black uppercase text-[10px] tracking-widest py-5 hover:bg-secondary transition-all cursor-pointer"
                >
                  {t("abort")}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white font-black uppercase text-[10px] tracking-widest py-5 shadow-lg hover:bg-black transition-all cursor-pointer"
                >
                  {t("launchCampaignBtn")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
