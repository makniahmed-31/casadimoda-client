"use client";

import { useState } from "react";
import { Plus, Trash2, Tag, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";

import { Category, CategoryFormData } from "@/types";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/utils/api";

export default function CategoriesList({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const t = useTranslations("admin");
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [showModal, setShowModal] = useState(false);

  const { register, handleSubmit, reset } = useForm<CategoryFormData>();

  const fetchCategories = async () => {
    const res = await apiFetch("/api/admin/categories");
    const data = await res.json();
    setCategories(data);
  };

  const deleteCategory = async (id: string) => {
    if (!confirm(t("deleteCategoryConfirm"))) return;
    await apiFetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
    fetchCategories();
  };

  const onSubmit = async (data: CategoryFormData) => {
    const slug = data.name.toLowerCase().replace(/ /g, "-");
    await apiFetch("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify({ ...data, slug }),
      headers: { "Content-Type": "application/json" },
    });
    reset();
    setShowModal(false);
    fetchCategories();
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-secondary tracking-tighter lowercase">
            {t("categoriesTitle")}
            <span className="text-accent text-5xl">.</span>
          </h1>
          <p className="text-text-dark/40 font-bold uppercase tracking-widest text-[10px] mt-2">
            {t("categoriesSubtitle")}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-black text-white px-8 py-4  font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <Plus size={16} /> {t("createCategory")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat._id}
            className="bg-white p-8  border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-accent opacity-20 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start mb-6">
              <div className="bg-secondary p-4  text-accent">
                <Tag size={24} />
              </div>
              <button
                onClick={() => deleteCategory(cat._id)}
                className="text-red-200 hover:text-red-500 transition-colors cursor-pointer"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <h3 className="text-xl font-black text-primary mb-2">{cat.name}</h3>
            <p className="text-xs text-text-dark/50 leading-relaxed mb-6">
              {cat.description || t("noCollectionDescription")}
            </p>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent group-hover:gap-4 transition-all cursor-pointer">
              {t("manageProducts")} <ArrowRight size={14} />
            </div>
          </div>
        ))}
      </div>

      {/* Basic Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg  p-10 shadow-2xl animate-in zoom-in duration-300">
            <h2 className="text-2xl font-black text-primary mb-8 tracking-tight">
              {t("newCollection")}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-dark/30 ml-2">
                  {t("collectionName")}
                </label>
                <input
                  {...register("name", { required: true })}
                  className="w-full bg-secondary border-none  p-4 outline-none font-bold text-primary"
                  placeholder={t("collectionNamePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-dark/30 ml-2">
                  {t("curatedDescription")}
                </label>
                <textarea
                  {...register("description")}
                  className="w-full bg-secondary border-none  p-4 outline-none font-bold text-primary min-h-[100px]"
                  placeholder={t("categoryDescriptionPlaceholder")}
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
                  {t("establishCollection")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
