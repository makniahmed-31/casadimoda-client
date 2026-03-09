"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Search, Filter, Edit, Trash2, Package, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CldUploadWidget,
  CloudinaryUploadWidgetResults,
} from "next-cloudinary";
import { useTranslations } from "next-intl";
import { Product, SubCategory, Category, Brand } from "@/types";
import Pagination from "@/components/Pagination";
import { apiFetch } from "@/utils/api";

export default function ProductsTable({
  initialProducts,
  totalPages,
  subCategories,
  categories,
  brands,
}: {
  initialProducts: Product[];
  totalPages: number;
  subCategories: SubCategory[];
  categories: Category[];
  brands: Brand[];
}) {
  const t = useTranslations("admin");
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sizes, setSizes] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState("");
  const [colors, setColors] = useState<string[]>([]);
  const [colorImages, setColorImages] = useState<Record<string, string>>({});
  const [dbColors, setDbColors] = useState<
    { _id: string; name: string; hex: string }[]
  >([]);
  const [selectedDbColor, setSelectedDbColor] = useState("");
  const { register, handleSubmit, reset, setValue, watch } = useForm<Product>();
  const selectedCategory = watch("category");
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentPage = Number(searchParams.get("page")) || 1;

  // Initialize search query from URL
  useEffect(() => {
    const query = searchParams.get("q") || "";
    setSearchQuery(query);
  }, [searchParams]);

  // Handle search with debounce
  useEffect(() => {
    // Skip if the search query matches what's already in the URL
    const currentQuery = searchParams.get("q") || "";
    if (currentQuery === searchQuery) return;

    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchQuery) {
        params.set("q", searchQuery);
        params.delete("page"); // Reset to page 1 when searching
      } else {
        params.delete("q");
      }
      const queryString = params.toString();
      router.push(`/admin/products${queryString ? `?${queryString}` : ""}`);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const openModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      Object.keys(product).forEach((key) => {
        setValue(key as keyof Product, product[key as keyof Product]);
      });
      setSizes(product.sizes || []);
      setColors(product.colors || []);
      const ci: Record<string, string> = {};
      (product.colorImages || []).forEach(({ color, image }) => {
        ci[color] = image;
      });
      setColorImages(ci);
    } else {
      setEditingProduct(null);
      reset({
        name: "",
        slug: "",
        category: "",
        brand: "",
        price: 0,
        discountPrice: 0,
        countInStock: 0,
        description: "",
        deliveryTime: "",
        dimensions: "",
        weight: "",
        cbm: 0,
        hsCode: "",
        image: "",
        isFeatured: false,
        parentCategory: "detail",
      });
      setSizes([]);
      setColors([]);
      setColorImages({});
    }
    setSizeInput("");
    setSelectedDbColor("");
    setShowModal(true);
  };

  useEffect(() => {
    apiFetch("/api/colors")
      .then((r) => r.json())
      .then(setDbColors)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (searchParams.get("action") === "create") {
      openModal();
      // Remove the query param so it doesn't open again on refresh
      router.replace("/admin/products");
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showModal]);

  const onSubmit = async (data: Product) => {
    const url = "/api/admin/products";
    const method = editingProduct ? "PUT" : "POST";
    const colorImagesArray = colors
      .filter((color) => colorImages[color])
      .map((color) => ({
        color,
        image: colorImages[color],
        hex: dbColors.find((c) => c.name === color)?.hex || "",
      }));

    // First color image is the primary product image
    const primaryImage =
      colors.length > 0 && colorImages[colors[0]]
        ? colorImages[colors[0]]
        : data.image || "";

    const body = editingProduct
      ? {
          ...data,
          id: editingProduct._id,
          image: primaryImage,
          sizes,
          colors,
          colorImages: colorImagesArray,
        }
      : {
          ...data,
          image: primaryImage,
          sizes,
          colors,
          colorImages: colorImagesArray,
        };

    // Auto-generate slug if empty
    if (!data.slug) {
      body.slug = data.name
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
    }

    setSaving(true);
    const res = await apiFetch(url, {
      method,
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    setSaving(false);
    if (res.ok) {
      setShowModal(false);
      router.refresh();
    } else {
      const err = await res.json();
      alert(err.message || t("failedToSave"));
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm(t("removeConfirm"))) return;
    await apiFetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-secondary tracking-tighter lowercase">
            {t("inventoryRegistry")}
            <span className="text-accent text-5xl">.</span>
          </h1>
          <p className="text-text-dark/40 font-bold uppercase tracking-widest text-[10px] mt-2">
            {t("inventorySubtitle")}
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-primary hover:bg-black text-white px-8 py-4  font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <Plus size={16} /> {t("enlistNewItem")}
        </button>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden p-4 sm:p-6 lg:p-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dark/20"
              size={18}
            />
            <input
              className="w-full bg-secondary border-none  py-4 pl-12 pr-4 outline-none font-bold text-primary placeholder:text-gray-300"
              placeholder={t("searchRegistry")}
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <button className="bg-secondary px-6 py-4  flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all cursor-pointer">
            <Filter size={16} /> {t("filters")}
          </button>
        </div>

        {/* Catalog Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="pb-6 text-[11px] font-black uppercase tracking-widest text-primary">
                  {t("productDetails")}
                </th>
                <th className="pb-6 text-[11px] font-black uppercase tracking-widest text-primary">
                  {t("category")}
                </th>
                <th className="pb-6 text-[11px] font-black uppercase tracking-widest text-primary">
                  {t("subcategory")}
                </th>
                <th className="pb-6 text-[11px] font-black uppercase tracking-widest text-primary">
                  {t("inventory")}
                </th>
                <th className="pb-6 text-[11px] font-black uppercase tracking-widest text-primary">
                  {t("retailValue")}
                </th>
                <th className="pb-6 text-[11px] font-black uppercase tracking-widest text-primary text-right">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {initialProducts.map((product) => (
                <tr
                  key={product._id}
                  className="group hover:bg-secondary/10 transition-colors"
                >
                  <td className="py-6">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-20  overflow-hidden bg-secondary flex-shrink-0">
                        <Image
                          src={product.image || "/images/placeholder.jpg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                          unoptimized={true}
                        />
                      </div>
                      <div>
                        <p className="font-black text-primary text-sm leading-tight mb-1">
                          {product.name}
                        </p>
                        <p className="text-[10px] font-bold text-text-dark/30 uppercase tracking-widest">
                          {product.brand}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-6">
                    <span className="text-[10px] font-black text-accent bg-accent/5 px-3 py-1  uppercase tracking-widest">
                      {product.category}
                    </span>
                  </td>
                  <td className="py-6">
                    <span className="text-[10px] font-bold text-text-dark/40 bg-secondary px-3 py-1  uppercase tracking-widest">
                      {product.subCategory}
                    </span>
                  </td>
                  <td className="py-6">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          product.countInStock > 0
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      />
                      <span className="text-xs font-black text-primary">
                        {product.countInStock} {t("units")}
                      </span>
                    </div>
                  </td>
                  <td className="py-6">
                    <div className="flex flex-col">
                      <span
                        suppressHydrationWarning
                        className={`text-lg font-black ${
                          product.discountPrice > 0
                            ? "text-red-500"
                            : "text-primary"
                        }`}
                      >
                        $
                        {(
                          product.discountPrice || product.price
                        ).toLocaleString("en-US")}
                      </span>
                      {product.discountPrice > 0 && (
                        <span
                          suppressHydrationWarning
                          className="text-[10px] font-bold text-text-dark/30 line-through"
                        >
                          ${product.price.toLocaleString("en-US")}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openModal(product)}
                        className="p-3 bg-secondary text-primary  hover:bg-white hover:text-accent shadow-sm transition-all cursor-pointer"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteProduct(product._id)}
                        className="p-3 bg-secondary text-primary  hover:bg-red-50 hover:text-red-500 shadow-sm transition-all cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {initialProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Package size={48} className="text-gray-100" />
                      <p className="text-xs font-bold text-text-dark/30 uppercase tracking-[0.2em]">
                        {t("emptyInventory")}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pb-8">
          <Pagination totalPages={totalPages} />
        </div>
      </div>

      {/* Premium Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl  shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-10 pb-4 flex justify-between items-center bg-white z-10">
              <h2 className="text-3xl font-black text-primary tracking-tight">
                {editingProduct
                  ? t("refineMasterpiece")
                  : t("enlistNewCreation")}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-secondary rounded-full transition-all cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col flex-grow overflow-hidden"
            >
              <div className="flex-grow overflow-y-auto p-10 pt-4 space-y-4 md:space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Side: General Info */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-primary ml-2">
                        {t("creationName")}
                      </label>
                      <input
                        {...register("name", { required: true })}
                        className="w-full bg-secondary border-none  p-4 outline-none font-bold text-primary"
                        placeholder={t("namePlaceholder")}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-primary ml-2">
                          {t("category")}
                        </label>
                        <select
                          {...register("category", { required: true })}
                          className="w-full bg-secondary border-none  p-4 outline-none font-bold text-primary appearance-none"
                        >
                          <option value="">{t("selectCategory")}</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat.name}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-primary ml-2">
                          {t("subcategory")}
                        </label>
                        <select
                          {...register("subCategory", { required: true })}
                          className="w-full bg-secondary border-none  p-4 outline-none font-bold text-primary appearance-none"
                        >
                          <option value="">{t("selectSubcategory")}</option>
                          {subCategories
                            .filter(
                              (sub) =>
                                !selectedCategory ||
                                sub.parentCategory === selectedCategory,
                            )
                            .map((sub) => (
                              <option key={sub._id} value={sub.name}>
                                {sub.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-primary ml-2">
                        {t("brand")}
                      </label>
                      <select
                        {...register("brand", { required: true })}
                        className="w-full bg-secondary border-none  p-4 outline-none font-bold text-primary appearance-none"
                      >
                        <option value="">{t("selectBrand")}</option>
                        {brands.map((brand) => (
                          <option key={brand._id} value={brand.name}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-primary ml-2">
                        {t("parentCategory")}
                      </label>
                      <select
                        {...register("parentCategory", { required: true })}
                        className="w-full bg-secondary border-none  p-4 outline-none font-bold text-primary appearance-none"
                      >
                        <option value="detail">{t("detail")}</option>
                        <option value="gros">{t("gros")}</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-primary ml-2">
                        {t("sizes")}
                      </label>
                      <div className="flex gap-2">
                        <input
                          value={sizeInput}
                          onChange={(e) => setSizeInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (
                                sizeInput.trim() &&
                                !sizes.includes(sizeInput.trim())
                              ) {
                                setSizes([...sizes, sizeInput.trim()]);
                                setSizeInput("");
                              }
                            }
                          }}
                          className="flex-1 bg-secondary border-none p-4 outline-none font-bold text-primary"
                          placeholder={t("sizePlaceholder")}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              sizeInput.trim() &&
                              !sizes.includes(sizeInput.trim())
                            ) {
                              setSizes([...sizes, sizeInput.trim()]);
                              setSizeInput("");
                            }
                          }}
                          className="bg-accent/10 text-accent font-black uppercase text-[10px] tracking-widest px-4 hover:bg-accent/20 transition-all cursor-pointer"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      {sizes.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {sizes.map((size) => (
                            <span
                              key={size}
                              className="bg-secondary text-primary font-bold text-xs px-3 py-1 flex items-center gap-1"
                            >
                              {size}
                              <button
                                type="button"
                                onClick={() =>
                                  setSizes(sizes.filter((s) => s !== size))
                                }
                                className="text-text-dark/30 hover:text-red-500 cursor-pointer"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-primary ml-2">
                        {t("colors")}
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={selectedDbColor}
                          onChange={(e) => setSelectedDbColor(e.target.value)}
                          className="flex-1 bg-secondary border-none p-4 outline-none font-bold text-primary appearance-none"
                        >
                          <option value="">{t("selectColor")}</option>
                          {dbColors
                            .filter((c) => !colors.includes(c.name))
                            .map((c) => (
                              <option key={c._id} value={c.name}>
                                {c.name} ({c.hex})
                              </option>
                            ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              selectedDbColor &&
                              !colors.includes(selectedDbColor)
                            ) {
                              setColors([...colors, selectedDbColor]);
                              setSelectedDbColor("");
                            }
                          }}
                          className="bg-accent/10 text-accent font-black uppercase text-[10px] tracking-widest px-4 hover:bg-accent/20 transition-all cursor-pointer"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      {colors.length > 0 && (
                        <div className="space-y-2 mt-2">
                          {colors.map((color) => (
                            <div
                              key={color}
                              className="flex items-center gap-2 bg-secondary px-3 py-2"
                            >
                              <span className="flex-1 text-primary font-bold text-xs">
                                {color}
                              </span>
                              {colorImages[color] ? (
                                <div className="relative w-10 h-10 overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={colorImages[color]}
                                    alt={color}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : null}
                              <CldUploadWidget
                                uploadPreset="iqsmn6rq"
                                onSuccess={(
                                  result: CloudinaryUploadWidgetResults,
                                ) => {
                                  if (result.event !== "success") return;
                                  const info = result.info;
                                  if (
                                    info &&
                                    typeof info === "object" &&
                                    "secure_url" in info
                                  ) {
                                    setColorImages((prev) => ({
                                      ...prev,
                                      [color]: info.secure_url as string,
                                    }));
                                  }
                                }}
                              >
                                {({ open }) => (
                                  <button
                                    type="button"
                                    onClick={() => open()}
                                    className="text-[9px] font-black uppercase tracking-widest text-accent border border-accent/30 px-2 py-1 hover:bg-accent/10 transition-all cursor-pointer flex-shrink-0"
                                  >
                                    {colorImages[color]
                                      ? t("changeImage")
                                      : t("addImage")}
                                  </button>
                                )}
                              </CldUploadWidget>
                              <button
                                type="button"
                                onClick={() => {
                                  setColors(colors.filter((c) => c !== color));
                                  setColorImages((prev) => {
                                    const n = { ...prev };
                                    delete n[color];
                                    return n;
                                  });
                                }}
                                className="text-text-dark/30 hover:text-red-500 cursor-pointer flex-shrink-0"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-primary ml-2">
                          {t("originalPrice")}
                        </label>
                        <input
                          type="number"
                          {...register("price", { required: true })}
                          className="w-full bg-secondary border-none  p-4 outline-none font-bold text-primary"
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-primary ml-2">
                          {t("discountPrice")}
                        </label>
                        <input
                          type="number"
                          {...register("discountPrice")}
                          className="w-full bg-secondary border-none  p-4 outline-none font-bold text-red-500"
                          placeholder={t("optional")}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-primary ml-2">
                          {t("inStock")}
                        </label>
                        <input
                          type="number"
                          {...register("countInStock", { required: true })}
                          className="w-full bg-secondary border-none  p-4 outline-none font-bold text-primary"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Media & Details */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-primary ml-2">
                        {t("narrativeDescription")}
                      </label>
                      <textarea
                        {...register("description", { required: true })}
                        className="w-full bg-secondary border-none  p-4 outline-none font-bold text-primary min-h-[120px]"
                        placeholder={t("descriptionPlaceholder")}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-primary ml-2">
                          {t("deliveryTime")}
                        </label>
                        <input
                          {...register("deliveryTime")}
                          className="w-full bg-secondary border-none  p-4 outline-none font-bold text-primary"
                          placeholder={t("deliveryTimePlaceholder")}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-primary ml-2">
                          {t("dimensions")}
                        </label>
                        <input
                          {...register("dimensions")}
                          className="w-full bg-secondary border-none  p-4 outline-none font-bold text-primary"
                          placeholder={t("dimensionsPlaceholder")}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-secondary ">
                      <input
                        type="checkbox"
                        {...register("isFeatured")}
                        className="w-5 h-5 accent-accent"
                        id="isFeatured"
                      />
                      <label
                        htmlFor="isFeatured"
                        className="text-[11px] font-black uppercase tracking-widest text-primary cursor-pointer"
                      >
                        {t("featuredCreation")}
                      </label>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-primary ml-2">
                        {t("registrySlug")}
                      </label>
                      <input
                        {...register("slug")}
                        className="w-full bg-secondary border-none  p-4 outline-none font-mono text-xs text-text-dark/50"
                        placeholder={t("slugPlaceholder")}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-10 pt-6 border-t border-gray-50 flex gap-4 bg-white">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 text-primary font-black uppercase text-[10px] tracking-widest py-6 hover:bg-secondary  transition-all cursor-pointer"
                >
                  {t("abortMission")}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-primary text-white font-black uppercase text-[10px] tracking-widest py-6  shadow-xl hover:bg-black transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? t("committing") : t("commitToRegistry")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
