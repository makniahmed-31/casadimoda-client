"use client";

import { useState } from "react";
import { Plus, Trash2, Edit, Layers, ArrowRight, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { SubCategory, SubCategoryFormData, Category } from "@/types";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/utils/api";

export default function SubCategoriesList({
  initialSubCategories,
  categories,
}: {
  initialSubCategories: SubCategory[];
  categories: Category[];
}) {
  const t = useTranslations("admin");
  const [subcategories, setSubcategories] =
    useState<SubCategory[]>(initialSubCategories);
  const [showModal, setShowModal] = useState(false);
  const [editingSub, setEditingSub] = useState<SubCategory | null>(null);
  const [saving, setSaving] = useState(false);

  const router = useRouter();
  const { register, handleSubmit, reset, setValue } =
    useForm<SubCategoryFormData>();

  const fetchSubCategories = async () => {
    const res = await apiFetch("/api/admin/subcategories");
    const data = await res.json();
    setSubcategories(data);
  };

  const openModal = (sub: SubCategory | null = null) => {
    if (sub) {
      setEditingSub(sub);
      setValue("name", sub.name);
      setValue("parentCategory", sub.parentCategory);
      setValue("description", sub.description);
    } else {
      setEditingSub(null);
      reset({
        name: "",
        parentCategory: categories[0]?.name || "",
        description: "",
      });
    }
    setShowModal(true);
  };

  const onSubmit = async (data: SubCategoryFormData) => {
    setSaving(true);
    const slug = data.name.toLowerCase().replace(/ /g, "-");
    const url = "/api/admin/subcategories";
    const method = editingSub ? "PUT" : "POST";
    const body = editingSub
      ? { ...data, id: editingSub._id, slug }
      : { ...data, slug };

    await apiFetch(url, {
      method,
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    setSaving(false);
    setShowModal(false);
    fetchSubCategories();
    router.refresh();
  };

  const deleteSub = async (id: string) => {
    if (!confirm(t("deleteSubcategoryConfirm"))) return;
    await apiFetch(`/api/admin/subcategories?id=${id}`, { method: "DELETE" });
    fetchSubCategories();
    router.refresh();
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-secondary tracking-tighter lowercase">
            {t("subcategoriesTitle")}
            <span className="text-accent text-5xl">.</span>
          </h1>
          <p className="text-text-dark/40 font-bold uppercase tracking-widest text-[10px] mt-2">
            {t("subcategoriesSubtitle")}
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-primary hover:bg-black text-white px-8 py-4  font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <Plus size={16} /> {t("establishNewLine")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subcategories.length === 0 ? (
          <div className="col-span-full bg-white p-20  border border-gray-100 flex flex-col items-center gap-4">
            <Layers size={48} className="text-gray-100" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dark/30">
              {t("noSubcategories")}
            </p>
          </div>
        ) : (
          subcategories.map((sub) => (
            <div
              key={sub._id}
              className="bg-white p-8  border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-accent opacity-20 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-start mb-6">
                <div className="bg-secondary p-4  text-accent group-hover:bg-accent/10 transition-colors">
                  <Layers size={24} />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(sub)}
                    className="p-2 text-primary/30 hover:text-primary transition-colors cursor-pointer"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => deleteSub(sub._id)}
                    className="p-2 text-red-200 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="mb-2">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-accent bg-accent/5 px-2 py-0.5 rounded">
                  {sub.parentCategory}
                </span>
                <h3 className="text-xl font-black text-primary mt-2">
                  {sub.name}
                </h3>
              </div>

              <p className="text-xs text-text-dark/50 leading-relaxed mb-6">
                {sub.description || t("noSubcategoryDescription")}
              </p>

              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary group-hover:text-accent transition-colors">
                {t("viewCollection")} <ArrowRight size={14} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Luxury Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg  shadow-2xl animate-in zoom-in duration-300 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 p-2 hover:bg-secondary rounded-full transition-colors"
            >
              <X size={20} className="text-primary" />
            </button>

            <div className="p-10">
              <h2 className="text-2xl font-black text-primary mb-8 tracking-tight">
                {editingSub ? t("refineBoutiqueLine") : t("establishNewLine")}
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-dark/30 ml-2">
                    {t("lineName")}
                  </label>
                  <input
                    {...register("name", { required: true })}
                    className="w-full bg-secondary border-none  p-4 outline-none font-bold text-primary"
                    placeholder={t("lineNamePlaceholder")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-dark/30 ml-2">
                    {t("parentCollection")}
                  </label>
                  <select
                    {...register("parentCategory", { required: true })}
                    className="w-full bg-secondary border-none  p-4 outline-none font-bold text-primary appearance-none"
                  >
                    <option value="" disabled>
                      {t("selectParentCollection")}
                    </option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-dark/30 ml-2">
                    {t("lineDescription")}
                  </label>
                  <textarea
                    {...register("description")}
                    className="w-full bg-secondary border-none  p-4 outline-none font-bold text-primary min-h-[100px]"
                    placeholder={t("lineDescriptionPlaceholder")}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 text-primary font-black uppercase text-[10px] tracking-widest py-5 hover:bg-secondary  transition-all cursor-pointer"
                  >
                    {t("abort")}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-primary text-white font-black uppercase text-[10px] tracking-widest py-5  shadow-lg hover:bg-black transition-all cursor-pointer disabled:opacity-50"
                  >
                    {saving ? t("signing") : t("establishLine")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
