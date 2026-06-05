"use client";

import ImageUpload from "@/components/ImageUpload";
import Pagination from "@/components/Pagination";
import { Brand, Category, Product, SubCategory } from "@/types";
import { apiFetch } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  Edit,
  FileImage,
  Filter,
  Globe,
  Package,
  Palette,
  Plus,
  Search,
  Settings,
  Ship,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import type { ProductFormInput } from "./schema";
import { productSchema, stepFields } from "./schema";

const ALL_STEPS = [
  { id: "type", label: "Type", icon: Globe },
  { id: "details", label: "Details", icon: Package },
  { id: "variants", label: "Variants", icon: Palette },
  { id: "pricing", label: "Pricing", icon: Tag },
  { id: "media", label: "Media", icon: FileImage },
  { id: "shipping", label: "Shipping", icon: Ship },
  { id: "admin", label: "Admin", icon: Settings },
  { id: "review", label: "Review", icon: CheckCircle },
];

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
  const [selectedSize, setSelectedSize] = useState("");
  const [colors, setColors] = useState<string[]>([]);
  const [colorImages, setColorImages] = useState<Record<string, string[]>>({});
  const [primaryColor, setPrimaryColor] = useState("");
  const [dbColors, setDbColors] = useState<{ _id: string; name: string; hex: string }[]>([]);
  const [selectedDbColor, setSelectedDbColor] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<ProductFormInput>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormInput>,
    defaultValues: {
      productType: "local",
      currency: "TND",
      parentCategory: "detail",
      price: 0,
      discountPrice: 0,
      countInStock: 0,
      isFeatured: false,
    },
  });
  const selectedCategory = watch("category");
  const productType = watch("productType");
  const formData = watch();

  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = Number(searchParams.get("page")) || 1;

  const steps = ALL_STEPS.filter((s) => s.id !== "shipping" || productType === "international");
  const totalSteps = steps.length;
  const safeStep = Math.min(currentStep, totalSteps - 1);
  const currentStepId = steps[safeStep]?.id ?? "type";
  const isLastStep = safeStep === totalSteps - 1;

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, totalSteps - 1));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const handleNext = async () => {
    const fields = stepFields[currentStepId] ?? [];
    if (fields.length === 0) {
      nextStep();
      return;
    }
    const valid = await trigger(fields);
    if (valid) nextStep();
  };

  const canProceed = (): boolean => {
    switch (currentStepId) {
      case "type":
        return true;
      case "details":
        return !!formData.name && !!formData.category && !!formData.subCategory && !!formData.brand;
      case "variants":
        return true;
      case "pricing":
        return Number(formData.price) > 0;
      case "media":
        return !!formData.description;
      case "shipping":
        return !!(formData.cbm && Number(formData.cbm) > 0 && formData.deliveryTime);
      default:
        return true;
    }
  };

  useEffect(() => {
    const query = searchParams.get("q") || "";
    setSearchQuery(query);
  }, [searchParams]);

  useEffect(() => {
    const currentQuery = searchParams.get("q") || "";
    if (currentQuery === searchQuery) return;
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchQuery) {
        params.set("q", searchQuery);
        params.delete("page");
      } else {
        params.delete("q");
      }
      const queryString = params.toString();
      router.push(`/admin/products${queryString ? `?${queryString}` : ""}`);
    }, 500);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const openModal = (product: Product | null = null) => {
    setCurrentStep(0);
    setSubmitError(null);
    if (product) {
      setEditingProduct(product);
      Object.keys(product).forEach((key) => {
        setValue(
          key as keyof ProductFormInput,
          product[key as keyof ProductFormInput] as ProductFormInput[keyof ProductFormInput]
        );
      });
      setSizes(product.sizes || []);
      setColors(product.colors || []);
      const ci: Record<string, string[]> = {};
      (product.colorImages || []).forEach((c) => {
        ci[c.color] = c.images?.length ? c.images : [];
      });
      setColorImages(ci);
      const matchedPrimary =
        (product.colorImages || []).find((ci) => ci.images?.[0] === product.image)?.color ||
        product.colorImages?.[0]?.color ||
        "";
      setPrimaryColor(matchedPrimary);
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
        cbm: undefined,
        hsCode: "",
        isFeatured: false,
        parentCategory: "detail",
        productType: "local",
        currency: "TND",
      });
      setSizes([]);
      setColors([]);
      setColorImages({});
      setPrimaryColor("");
    }
    setSelectedSize("");
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

  const onSubmit = async (data: ProductFormInput) => {
    setSubmitError(null);
    const url = "/api/admin/products";
    const method = editingProduct ? "PUT" : "POST";
    const colorImagesArray = colors
      .filter((color) => colorImages[color]?.length)
      .map((color) => ({
        color,
        images: colorImages[color],
        hex: dbColors.find((c) => c.name === color)?.hex || "",
      }));
    const primaryImage =
      (primaryColor && colorImages[primaryColor]?.[0]) ||
      colorImages[colors.find((c) => colorImages[c]?.length) ?? ""]?.[0] ||
      "";
    const body = editingProduct
      ? { ...data, id: editingProduct._id, image: primaryImage, sizes, colors, colorImages: colorImagesArray }
      : { ...data, image: primaryImage, sizes, colors, colorImages: colorImagesArray };
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
      setSubmitError(err.message || t("failedToSave"));
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
          className="bg-primary hover:bg-black text-white px-8 py-4 font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <Plus size={16} /> {t("enlistNewItem")}
        </button>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden p-4 sm:p-6 lg:p-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dark/20" size={18} />
            <input
              className="w-full bg-secondary border-none py-4 pl-12 pr-4 outline-none font-bold text-primary placeholder:text-gray-300"
              placeholder={t("searchRegistry")}
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <button className="bg-secondary px-6 py-4 flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest hover:bg-gray-100 transition-all cursor-pointer">
            <Filter size={16} /> {t("filters")}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="pb-6 text-[11px] font-black uppercase tracking-widest text-primary">
                  {t("productDetails")}
                </th>
                <th className="pb-6 text-[11px] font-black uppercase tracking-widest text-primary">{t("category")}</th>
                <th className="pb-6 text-[11px] font-black uppercase tracking-widest text-primary">
                  {t("subcategory")}
                </th>
                <th className="pb-6 text-[11px] font-black uppercase tracking-widest text-primary">{t("inventory")}</th>
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
                <tr key={product._id} className="hover:bg-secondary/10 transition-colors">
                  <td className="py-6">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-20 overflow-hidden bg-secondary flex-shrink-0">
                        <Image
                          src={product.image || "/images/placeholder.jpg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                          unoptimized={true}
                        />
                      </div>
                      <div>
                        <p className="font-black text-primary text-sm leading-tight mb-1">{product.name}</p>
                        <p className="text-[10px] font-bold text-text-dark/30 uppercase tracking-widest">
                          {product.brand}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-6">
                    <span className="text-[10px] font-black text-accent bg-accent/5 px-3 py-1 uppercase tracking-widest">
                      {product.category}
                    </span>
                  </td>
                  <td className="py-6">
                    <span className="text-[10px] font-bold text-text-dark/40 bg-secondary px-3 py-1 uppercase tracking-widest">
                      {product.subCategory}
                    </span>
                  </td>
                  <td className="py-6">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${product.countInStock > 0 ? "bg-green-500" : "bg-red-500"}`}
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
                        className={`text-lg font-black ${product.discountPrice > 0 ? "text-red-500" : "text-primary"}`}
                      >
                        {(product.discountPrice || product.price).toLocaleString("en-US")} {product.currency || "TND"}
                      </span>
                      {product.discountPrice > 0 && (
                        <span suppressHydrationWarning className="text-[10px] font-bold text-text-dark/30 line-through">
                          {product.price.toLocaleString("en-US")} {product.currency || "TND"}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-6 text-right">
                    <div className="flex justify-end gap-2 ">
                      <button
                        onClick={() => openModal(product)}
                        className="p-3 bg-secondary text-primary hover:bg-white hover:text-accent shadow-sm transition-all cursor-pointer"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteProduct(product._id)}
                        className="p-3 bg-secondary text-primary hover:bg-red-50 hover:text-red-500 shadow-sm transition-all cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {initialProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
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

      {/* Product Modal — Stepper */}
      {showModal && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-2xl font-black text-primary tracking-tight">
                  {editingProduct ? t("refineMasterpiece") : t("enlistNewCreation")}
                </h2>
                <p className="text-[9px] font-bold uppercase tracking-widest text-text-dark/30 mt-0.5">
                  Step {safeStep + 1} of {totalSteps} — {steps[safeStep].label}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-secondary rounded-full transition-all cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            {/* Progress */}
            <div className="px-8 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center">
                {steps.map((step, index) => (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center shrink-0">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                          index < safeStep
                            ? "bg-accent text-white"
                            : index === safeStep
                              ? "bg-accent text-white ring-4 ring-accent/20"
                              : "bg-secondary text-primary/30"
                        }`}
                      >
                        <step.icon size={12} />
                      </div>
                      <span
                        className={`text-[8px] font-bold uppercase tracking-widest mt-1 ${
                          index <= safeStep ? "text-accent" : "text-text-dark/20"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-px mx-2 transition-all ${index < safeStep ? "bg-accent" : "bg-gray-200"}`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-grow overflow-hidden">
              <div className="flex-grow overflow-y-auto p-8 space-y-6">
                {/* Step: Type */}
                {currentStepId === "type" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-black text-primary mb-1">{t("productType")}</h3>
                      <p className="text-sm text-text-dark/40">Is this a local or international product?</p>
                    </div>
                    <input type="hidden" {...register("productType")} />
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setValue("productType", "local")}
                        className={`p-6 border-2 text-left transition-all cursor-pointer ${
                          productType !== "international"
                            ? "border-accent bg-accent/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Package
                          size={28}
                          className={productType !== "international" ? "text-accent" : "text-primary/30"}
                        />
                        <p className="font-black text-primary mt-4 text-base">{t("local")}</p>
                        <p className="text-xs text-text-dark/40 mt-1 leading-relaxed">
                          Products sourced and shipped locally within the country
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setValue("productType", "international")}
                        className={`p-6 border-2 text-left transition-all cursor-pointer ${
                          productType === "international"
                            ? "border-accent bg-accent/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Globe
                          size={28}
                          className={productType === "international" ? "text-accent" : "text-primary/30"}
                        />
                        <p className="font-black text-primary mt-4 text-base">{t("international")}</p>
                        <p className="text-xs text-text-dark/40 mt-1 leading-relaxed">
                          Imported products — requires CBM and shipping time
                        </p>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step: Details */}
                {currentStepId === "details" && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-lg font-black text-primary mb-1">Product Details</h3>
                      <p className="text-sm text-text-dark/40">Basic product information</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-primary">
                        {t("creationName")}
                      </label>
                      <input
                        {...register("name")}
                        className={`w-full bg-secondary border-none p-4 outline-none font-bold text-primary ${errors.name ? "ring-1 ring-red-400" : ""}`}
                        placeholder={t("namePlaceholder")}
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-primary">
                          {t("category")}
                        </label>
                        <div className="relative">
                          <select
                            {...register("category")}
                            className={`w-full bg-secondary border-none p-4 pr-10 outline-none font-bold text-primary appearance-none cursor-pointer ${errors.category ? "ring-1 ring-red-400" : ""}`}
                          >
                            <option value="">{t("selectCategory")}</option>
                            {categories.map((cat) => (
                              <option key={cat._id} value={cat.name}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={14}
                            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary/40"
                          />
                        </div>
                        {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-primary">
                          {t("subcategory")}
                        </label>
                        <div className="relative">
                          <select
                            {...register("subCategory")}
                            className={`w-full bg-secondary border-none p-4 pr-10 outline-none font-bold text-primary appearance-none cursor-pointer ${errors.subCategory ? "ring-1 ring-red-400" : ""}`}
                          >
                            <option value="">{t("selectSubcategory")}</option>
                            {subCategories
                              .filter((sub) => !selectedCategory || sub.parentCategory === selectedCategory)
                              .map((sub) => (
                                <option key={sub._id} value={sub.name}>
                                  {sub.name}
                                </option>
                              ))}
                          </select>
                          <ChevronDown
                            size={14}
                            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary/40"
                          />
                        </div>
                        {errors.subCategory && (
                          <p className="text-red-500 text-xs mt-1">{errors.subCategory.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-primary">
                          {t("brand")}
                        </label>
                        <div className="relative">
                          <select
                            {...register("brand")}
                            className={`w-full bg-secondary border-none p-4 pr-10 outline-none font-bold text-primary appearance-none cursor-pointer ${errors.brand ? "ring-1 ring-red-400" : ""}`}
                          >
                            <option value="">{t("selectBrand")}</option>
                            {brands.map((brand) => (
                              <option key={brand._id} value={brand.name}>
                                {brand.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={14}
                            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary/40"
                          />
                        </div>
                        {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-primary">
                          {t("parentCategory")}
                        </label>
                        <div className="relative">
                          <select
                            {...register("parentCategory", { required: true })}
                            className="w-full bg-secondary border-none p-4 pr-10 outline-none font-bold text-primary appearance-none cursor-pointer"
                          >
                            <option value="detail">{t("detail")}</option>
                            <option value="gros">{t("gros")}</option>
                          </select>
                          <ChevronDown
                            size={14}
                            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary/40"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step: Variants */}
                {currentStepId === "variants" && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-lg font-black text-primary mb-1">Variants</h3>
                      <p className="text-sm text-text-dark/40">Add sizes and colors (optional)</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-primary">
                        {t("sizes")}
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <select
                            value={selectedSize}
                            onChange={(e) => setSelectedSize(e.target.value)}
                            className="w-full bg-secondary border-none p-4 pr-10 outline-none font-bold text-primary appearance-none cursor-pointer"
                          >
                            <option value="">— Select a size —</option>
                            <optgroup label="Clothing">
                              {["XS", "S", "M", "L", "XL", "XXL", "XXXL"]
                                .filter((s) => !sizes.includes(s))
                                .map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                            </optgroup>
                            <optgroup label="Shoes (EU)">
                              {["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47"]
                                .filter((s) => !sizes.includes(s))
                                .map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                            </optgroup>
                          </select>
                          <ChevronDown
                            size={14}
                            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary/40"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedSize && !sizes.includes(selectedSize)) {
                              setSizes([...sizes, selectedSize]);
                              setSelectedSize("");
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
                                onClick={() => setSizes(sizes.filter((s) => s !== size))}
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
                      <label className="text-[11px] font-black uppercase tracking-widest text-primary">
                        {t("colors")}
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <select
                            value={selectedDbColor}
                            onChange={(e) => setSelectedDbColor(e.target.value)}
                            className="w-full bg-secondary border-none p-4 pr-10 outline-none font-bold text-primary appearance-none cursor-pointer"
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
                          <ChevronDown
                            size={14}
                            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary/40"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedDbColor && !colors.includes(selectedDbColor)) {
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
                          {colors.map((color) => {
                            const imgs = colorImages[color] ?? [];
                            return (
                              <div key={color} className="bg-secondary px-3 py-2 space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="flex-1 text-primary font-bold text-xs">{color}</span>
                                  {imgs.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => setPrimaryColor(color)}
                                      className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 border transition-all cursor-pointer flex-shrink-0 ${
                                        primaryColor === color
                                          ? "bg-accent text-white border-accent"
                                          : "border-gray-300 text-text-dark/30 hover:border-accent/50 hover:text-text-dark/60"
                                      }`}
                                    >
                                      {primaryColor === color ? "✓ Cover" : "Cover"}
                                    </button>
                                  )}
                                  <ImageUpload
                                    onSuccess={(url) => {
                                      setColorImages((prev) => ({
                                        ...prev,
                                        [color]: [...(prev[color] ?? []), url],
                                      }));
                                      if (!primaryColor) setPrimaryColor(color);
                                    }}
                                    label={`+ ${t("addImage")}`}
                                    buttonClassName="text-[9px] font-black uppercase tracking-widest text-accent border border-accent/30 px-2 py-1 hover:bg-accent/10 transition-all cursor-pointer flex-shrink-0"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setColors(colors.filter((c) => c !== color));
                                      setColorImages((prev) => {
                                        const n = { ...prev };
                                        delete n[color];
                                        return n;
                                      });
                                      if (primaryColor === color) setPrimaryColor("");
                                    }}
                                    className="text-text-dark/30 hover:text-red-500 cursor-pointer flex-shrink-0"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                                {imgs.length > 0 && (
                                  <div className="flex gap-2 flex-wrap">
                                    {imgs.map((url, idx) => (
                                      <div key={idx} className="relative flex-shrink-0">
                                        <div className="w-10 h-10 overflow-hidden bg-white border border-gray-100">
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img
                                            src={url}
                                            alt={`${color} ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setColorImages((prev) => {
                                              const updated = (prev[color] ?? []).filter((_, i) => i !== idx);
                                              if (updated.length === 0 && primaryColor === color) setPrimaryColor("");
                                              return { ...prev, [color]: updated };
                                            })
                                          }
                                          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white flex items-center justify-center rounded-full cursor-pointer hover:bg-red-600 transition-colors"
                                        >
                                          <X size={9} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step: Pricing */}
                {currentStepId === "pricing" && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-lg font-black text-primary mb-1">Pricing & Stock</h3>
                      <p className="text-sm text-text-dark/40">Set price and inventory levels</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-primary">Currency</label>
                      <input type="hidden" {...register("currency")} />
                      <div className="flex gap-2">
                        {(["TND", "USD", "EUR"] as const).map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setValue("currency", c)}
                            className={`flex-1 py-3 font-black text-sm uppercase tracking-widest border-2 transition-all cursor-pointer ${
                              formData.currency === c
                                ? "border-accent bg-accent/5 text-accent"
                                : "border-gray-200 text-primary/40 hover:border-gray-300"
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-primary">
                        {t("originalPrice")}
                      </label>
                      <input
                        type="number"
                        {...register("price")}
                        className={`w-full bg-secondary border-none p-4 outline-none font-bold text-primary ${errors.price ? "ring-1 ring-red-400" : ""}`}
                        placeholder="0"
                      />
                      {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-primary">
                        {t("discountPrice")}
                      </label>
                      <input
                        type="number"
                        {...register("discountPrice")}
                        className="w-full bg-secondary border-none p-4 outline-none font-bold text-red-500"
                        placeholder={t("optional")}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-primary">
                        {t("inStock")}
                      </label>
                      <input
                        type="number"
                        {...register("countInStock")}
                        className={`w-full bg-secondary border-none p-4 outline-none font-bold text-primary ${errors.countInStock ? "ring-1 ring-red-400" : ""}`}
                        placeholder="0"
                      />
                      {errors.countInStock && (
                        <p className="text-red-500 text-xs mt-1">{errors.countInStock.message}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step: Media */}
                {currentStepId === "media" && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-lg font-black text-primary mb-1">Media & Details</h3>
                      <p className="text-sm text-text-dark/40">Product image, description and physical specs</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-primary">
                        {t("narrativeDescription")}
                      </label>
                      <textarea
                        {...register("description")}
                        className={`w-full bg-secondary border-none p-4 outline-none font-bold text-primary min-h-[120px] resize-none ${errors.description ? "ring-1 ring-red-400" : ""}`}
                        placeholder={t("descriptionPlaceholder")}
                      />
                      {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-primary">
                        {t("dimensions")}
                      </label>
                      <input
                        {...register("dimensions")}
                        className="w-full bg-secondary border-none p-4 outline-none font-bold text-primary"
                        placeholder={t("dimensionsPlaceholder")}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-primary">
                          {t("weight")}
                        </label>
                        <input
                          {...register("weight")}
                          className="w-full bg-secondary border-none p-4 outline-none font-bold text-primary"
                          placeholder={t("weightPlaceholder")}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-primary">
                          {t("hsCode")}
                        </label>
                        <input
                          {...register("hsCode")}
                          className="w-full bg-secondary border-none p-4 outline-none font-bold text-primary"
                          placeholder={t("hsCodePlaceholder")}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step: Shipping (international only) */}
                {currentStepId === "shipping" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-black text-primary mb-1">Shipping Details</h3>
                      <p className="text-sm text-text-dark/40">Required for international products</p>
                    </div>

                    <div className="p-4 bg-accent/5 border border-accent/20 flex items-start gap-3">
                      <Ship size={16} className="text-accent shrink-0 mt-0.5" />
                      <p className="text-xs text-text-dark/60 leading-relaxed">
                        These details are required for customs clearance and logistics planning of international
                        shipments.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-primary">
                        {t("cbm")} <span className="text-accent">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        {...register("cbm")}
                        className={`w-full bg-secondary border-none p-4 outline-none font-bold text-primary ${errors.cbm ? "ring-1 ring-red-400" : ""}`}
                        placeholder={t("cbmPlaceholder")}
                      />
                      {errors.cbm && <p className="text-red-500 text-xs mt-1">{errors.cbm.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-primary">
                        {t("shippingTime")} <span className="text-accent">*</span>
                      </label>
                      <input
                        {...register("deliveryTime")}
                        className={`w-full bg-secondary border-none p-4 outline-none font-bold text-primary ${errors.deliveryTime ? "ring-1 ring-red-400" : ""}`}
                        placeholder={t("shippingTimePlaceholder")}
                      />
                      {errors.deliveryTime && (
                        <p className="text-red-500 text-xs mt-1">{errors.deliveryTime.message}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step: Admin */}
                {currentStepId === "admin" && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-lg font-black text-primary mb-1">Admin Settings</h3>
                      <p className="text-sm text-text-dark/40">Visibility and URL configuration</p>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-secondary">
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
                      <label className="text-[11px] font-black uppercase tracking-widest text-primary">
                        {t("registrySlug")}
                      </label>
                      <input
                        {...register("slug")}
                        className="w-full bg-secondary border-none p-4 outline-none font-mono text-xs text-text-dark/50"
                        placeholder={t("slugPlaceholder")}
                      />
                    </div>
                  </div>
                )}

                {/* Step: Review */}
                {currentStepId === "review" && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-black text-primary mb-1">Review & Commit</h3>
                      <p className="text-sm text-text-dark/40">Check details before saving to registry</p>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 bg-secondary">
                        <p className="text-[9px] font-black uppercase tracking-widest text-primary/40 mb-2">Type</p>
                        <p className="font-bold text-primary capitalize">{formData.productType || "local"}</p>
                      </div>

                      <div className="p-4 bg-secondary">
                        <p className="text-[9px] font-black uppercase tracking-widest text-primary/40 mb-2">Product</p>
                        <p className="font-bold text-primary">{formData.name}</p>
                        <p className="text-sm text-text-dark/40 mt-1">
                          {formData.category} / {formData.subCategory}
                        </p>
                        <p className="text-xs text-text-dark/30 mt-0.5">{formData.brand}</p>
                      </div>

                      <div className="p-4 bg-secondary">
                        <p className="text-[9px] font-black uppercase tracking-widest text-primary/40 mb-2">Pricing</p>
                        <p className="font-black text-accent text-lg">
                          {Number(formData.price).toLocaleString()} {formData.currency || "TND"}
                        </p>
                        {Number(formData.discountPrice) > 0 && (
                          <p className="text-sm text-red-500 mt-0.5">
                            {Number(formData.discountPrice).toLocaleString()} {formData.currency || "TND"} discounted
                          </p>
                        )}
                        <p className="text-xs text-text-dark/40 mt-1">
                          Stock: {formData.countInStock} {t("units")}
                        </p>
                      </div>

                      {(sizes.length > 0 || colors.length > 0) && (
                        <div className="p-4 bg-secondary">
                          <p className="text-[9px] font-black uppercase tracking-widest text-primary/40 mb-2">
                            Variants
                          </p>
                          {sizes.length > 0 && <p className="text-sm text-primary">Sizes: {sizes.join(", ")}</p>}
                          {colors.length > 0 && (
                            <p className="text-sm text-primary mt-1">Colors: {colors.join(", ")}</p>
                          )}
                        </div>
                      )}

                      {formData.productType === "international" && (
                        <div className="p-4 bg-accent/5 border border-accent/20">
                          <p className="text-[9px] font-black uppercase tracking-widest text-accent/60 mb-2">
                            Shipping (International)
                          </p>
                          <p className="text-sm text-primary">CBM: {formData.cbm}</p>
                          <p className="text-sm text-primary mt-1">Shipping Time: {formData.deliveryTime}</p>
                        </div>
                      )}

                      <div className="p-4 bg-secondary">
                        <p className="text-[9px] font-black uppercase tracking-widest text-primary/40 mb-2">Admin</p>
                        <p className="text-sm text-primary">Featured: {formData.isFeatured ? "Yes" : "No"}</p>
                        {formData.slug && <p className="text-xs text-text-dark/40 mt-1 font-mono">/{formData.slug}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="px-8 pb-5 border-t border-gray-100 shrink-0 bg-white">
                {submitError && (
                  <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
                    {submitError}
                  </div>
                )}
                <div className="flex gap-3 mt-4">
                  {safeStep > 0 ? (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex items-center gap-2 px-6 py-4 text-primary font-black uppercase text-[10px] tracking-widest hover:bg-secondary transition-all cursor-pointer"
                    >
                      <ArrowLeft size={14} /> Back
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 text-primary font-black uppercase text-[10px] tracking-widest py-4 hover:bg-secondary transition-all cursor-pointer"
                    >
                      {t("abortMission")}
                    </button>
                  )}

                  {isLastStep ? (
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-primary text-white font-black uppercase text-[10px] tracking-widest py-4 shadow-xl hover:bg-black transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? t("committing") : t("commitToRegistry")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex-1 bg-primary text-white font-black uppercase text-[10px] tracking-widest py-4 shadow-xl hover:bg-black transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      Next <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
