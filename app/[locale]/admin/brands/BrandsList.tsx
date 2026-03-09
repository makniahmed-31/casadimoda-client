"use client";

import { useState } from "react";
import { Plus, Trash2, ShieldCheck, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";

import { Brand } from "@/types";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/utils/api";

export default function BrandsList({
  initialBrands,
}: {
  initialBrands: Brand[];
}) {
  const t = useTranslations("admin");
  const [brands, setBrands] = useState<Brand[]>(initialBrands);
  const [showModal, setShowModal] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  const fetchBrands = async () => {
    const res = await apiFetch("/api/admin/brands");
    const data = await res.json();
    setBrands(data);
  };

  const onSubmit = async (data: Partial<Brand>) => {
    const slug = data.name?.toLowerCase().replace(/ /g, "-") || "";
    await apiFetch("/api/admin/brands", {
      method: "POST",
      body: JSON.stringify({ ...data, slug }),
      headers: { "Content-Type": "application/json" },
    });
    reset();
    setShowModal(false);
    fetchBrands();
  };

  const deleteBrand = async (id: string) => {
    if (!confirm(t("deleteBrandConfirm"))) return;
    await apiFetch(`/api/admin/brands?id=${id}`, { method: "DELETE" });
    fetchBrands();
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-secondary tracking-tighter lowercase">
            {t("brandsTitle")}
            <span className="text-accent text-5xl">.</span>
          </h1>
          <p className="text-text-dark/40 font-bold uppercase tracking-widest text-[10px] mt-2">
            {t("brandsSubtitle")}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-black text-white px-8 py-4  font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <Plus size={16} /> {t("enlistBrand")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {brands.map((brand) => (
          <div
            key={brand._id}
            className="bg-white p-8  border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="bg-secondary p-4  text-accent">
                <ShieldCheck size={24} />
              </div>
              <button
                onClick={() => deleteBrand(brand._id)}
                className="text-red-200 hover:text-red-500 transition-colors cursor-pointer"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <h3 className="text-xl font-black text-primary mb-2 tracking-tight">
              {brand.name}
            </h3>
            <p className="text-xs text-text-dark/50 leading-relaxed mb-6 line-clamp-2">
              {brand.description || t("noBiography")}
            </p>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent group-hover:gap-4 transition-all cursor-pointer">
              {t("brandInventory")} <ArrowRight size={14} />
            </div>
          </div>
        ))}
        {brands.length === 0 && (
          <div className="col-span-full py-20 bg-secondary/20 border-2 border-dashed border-gray-100  flex flex-col items-center justify-center gap-4 text-center p-10">
            <ShieldCheck size={64} className="text-gray-100" />
            <p className="text-xs font-bold text-text-dark/30 uppercase tracking-[0.2em]">
              {t("noBrands")}
            </p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg  p-10 shadow-2xl animate-in zoom-in duration-300">
            <h2 className="text-2xl font-black text-primary mb-8 tracking-tight italic">
              {t("enlistNewBrand")}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-dark/30 ml-2">
                  {t("brandIdentity")}
                </label>
                <input
                  {...register("name", { required: true })}
                  className="w-full bg-secondary border-none  p-4 outline-none font-bold text-primary"
                  placeholder={t("brandNamePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-dark/30 ml-2">
                  {t("biographicSummary")}
                </label>
                <textarea
                  {...register("description")}
                  className="w-full bg-secondary border-none  p-4 outline-none font-bold text-primary min-h-[100px]"
                  placeholder={t("biographyPlaceholder")}
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
                  {t("authorizeEnlistment")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
