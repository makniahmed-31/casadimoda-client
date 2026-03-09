"use client";

import { useState } from "react";
import { Plus, Gift, Copy, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { GiftCard, GiftCardFormData } from "@/types";
import { apiFetch } from "@/utils/api";

export interface GiftCardsListProps {
  initialGiftCards: GiftCard[];
}

export default function GiftCardsList({
  initialGiftCards,
}: GiftCardsListProps) {
  const t = useTranslations("admin");
  const [giftCards, setGiftCards] = useState<GiftCard[]>(initialGiftCards);
  const [showModal, setShowModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue } =
    useForm<GiftCardFormData>();

  const fetchGiftCards = async () => {
    const res = await apiFetch("/api/admin/giftcards");
    const data = await res.json();
    setGiftCards(data);
  };

  const generateCode = () => {
    const code =
      "CM-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    setValue("code", code);
  };

  const onSubmit = async (data: GiftCardFormData) => {
    await apiFetch("/api/admin/giftcards", {
      method: "POST",
      body: JSON.stringify({ ...data, balance: data.amount }),
      headers: { "Content-Type": "application/json" },
    });
    reset();
    setShowModal(false);
    fetchGiftCards();
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-secondary tracking-tighter lowercase">
            {t("giftCardsTitle")}
            <span className="text-accent text-5xl">.</span>
          </h1>
          <p className="text-text-dark/40 font-bold uppercase tracking-widest text-[10px] mt-2">
            {t("giftCardsSubtitle")}
          </p>
        </div>
        <button
          onClick={() => {
            reset();
            setShowModal(true);
          }}
          className="bg-primary hover:bg-black text-white px-8 py-4  font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <Plus size={16} /> {t("mintGiftCard")}
        </button>
      </div>

      <div className="bg-white  border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-secondary/50 border-b border-gray-100">
            <tr>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-text-dark/40">
                {t("referenceCode")}
              </th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-text-dark/40">
                {t("initialFaith")}
              </th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-text-dark/40">
                {t("currentSoul")}
              </th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-text-dark/40">
                {t("visibility")}
              </th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-text-dark/40 text-right">
                {t("action")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {giftCards.map((card) => (
              <tr
                key={card._id}
                className="hover:bg-secondary/20 transition-colors group"
              >
                <td className="px-8 py-6 font-mono font-bold text-primary flex items-center gap-3">
                  <div className="bg-accent/10 p-2  text-accent">
                    <Gift size={16} />
                  </div>
                  {card.code}
                </td>
                <td className="px-8 py-6 font-black text-primary">
                  {card.amount.toLocaleString()} TND
                </td>
                <td className="px-8 py-6 font-black text-accent">
                  {card.balance.toLocaleString()} TND
                </td>
                <td className="px-8 py-6">
                  <span
                    className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      card.isActive
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {card.isActive ? t("operational") : t("depleted")}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button
                    onClick={() => copyToClipboard(card.code)}
                    className="text-text-dark/20 hover:text-accent transition-colors cursor-pointer"
                  >
                    {copiedCode === card.code ? (
                      <CheckCircle size={18} className="text-green-500" />
                    ) : (
                      <Copy size={18} />
                    )}
                  </button>
                </td>
              </tr>
            ))}
            {giftCards.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <Gift size={48} className="text-gray-100" />
                    <p className="text-xs font-bold text-text-dark/30 uppercase tracking-[0.2em]">
                      {t("noGiftCards")}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg  p-10 shadow-2xl animate-in zoom-in duration-300">
            <h2 className="text-2xl font-black text-primary mb-8 tracking-tight italic">
              {t("mintPrivateAsset")}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-dark/30 ml-2">
                  {t("uniqueIdentifier")}
                </label>
                <div className="relative">
                  <input
                    {...register("code", { required: true })}
                    className="w-full bg-secondary border-none  p-4 outline-none font-bold text-primary font-mono pr-24"
                    placeholder="CM-XXXXXXXX"
                  />
                  <button
                    type="button"
                    onClick={generateCode}
                    className="absolute right-2 top-2 bottom-2 bg-primary text-white text-[9px] font-black uppercase tracking-widest px-4  hover:bg-black transition-all cursor-pointer"
                  >
                    {t("regen")}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-dark/30 ml-2">
                  {t("monetaryValue")}
                </label>
                <input
                  type="number"
                  {...register("amount", { required: true })}
                  className="w-full bg-secondary border-none  p-4 outline-none font-bold text-primary"
                  placeholder={t("amountPlaceholder")}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 text-primary font-black uppercase text-[10px] tracking-widest py-5 hover:bg-secondary  transition-all cursor-pointer"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-accent text-primary font-black uppercase text-[10px] tracking-widest py-5  shadow-lg border-2 border-transparent hover:border-primary transition-all cursor-pointer"
                >
                  {t("confirmMinting")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
