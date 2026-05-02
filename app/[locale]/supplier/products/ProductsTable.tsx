"use client";

import ImageUpload from "@/components/ImageUpload";
import { Brand, Category, Product, SubCategory } from "@/types";
import { apiFetch } from "@/utils/api";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  Clock,
  Edit,
  FileImage,
  Globe,
  Package,
  Palette,
  Plus,
  Search,
  Ship,
  Tag,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface ProductsResponse {
  products: Product[];
  totalPages: number;
  totalProducts: number;
  currentPage: number;
}

const ALL_STEPS = [
  { id: "type", label: "Type", icon: Globe },
  { id: "details", label: "Details", icon: Package },
  { id: "variants", label: "Variants", icon: Palette },
  { id: "pricing", label: "Pricing", icon: Tag },
  { id: "media", label: "Media", icon: FileImage },
  { id: "shipping", label: "Shipping", icon: Ship },
  { id: "review", label: "Review", icon: CheckCircle },
];

export default function SupplierProductsTable({
  subCategories,
  categories,
  brands,
}: {
  subCategories: SubCategory[];
  categories: Category[];
  brands: Brand[];
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierStatus, setSupplierStatus] = useState<string | null>(null);
  const [sizes, setSizes] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [colors, setColors] = useState<string[]>([]);
  const [colorImages, setColorImages] = useState<Record<string, string>>({});
  const [primaryColor, setPrimaryColor] = useState("");
  const [dbColors, setDbColors] = useState<{ _id: string; name: string; hex: string }[]>([]);
  const [selectedDbColor, setSelectedDbColor] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

  const { register, handleSubmit, reset, setValue, watch } = useForm<Product>();
  const selectedCategory = watch("category");
  const productType = watch("productType");
  const formData = watch();

  const steps = ALL_STEPS.filter((s) => s.id !== "shipping" || productType === "international");
  const totalSteps = steps.length;
  const safeStep = Math.min(currentStep, totalSteps - 1);
  const currentStepId = steps[safeStep]?.id ?? "type";
  const isLastStep = safeStep === totalSteps - 1;

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, totalSteps - 1));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

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
    const fetchStatus = async () => {
      try {
        const res = await apiFetch("/api/supplier/profile");
        if (res.ok) {
          const data = await res.json();
          setSupplierStatus(data.status);
        }
      } catch (error) {
        console.error("Error fetching supplier status:", error);
      }
    };
    fetchStatus();
  }, []);

  const fetchProducts = async (page = 1, search = "", status = "all") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        ...(search && { search }),
        ...(status !== "all" && { status }),
      });
      const res = await apiFetch(`/api/supplier/products?${params}`);
      if (res.ok) {
        const data: ProductsResponse = await res.json();
        setProducts(data.products);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1, searchQuery, statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    apiFetch("/api/colors")
      .then((r) => r.json())
      .then(setDbColors)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts(1, searchQuery, statusFilter);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handlePageChange = (page: number) => {
    fetchProducts(page, searchQuery, statusFilter);
  };

  const openModal = (product: Product | null = null) => {
    if (supplierStatus !== "approved") {
      alert("Your account must be approved before you can add products.");
      return;
    }
    setCurrentStep(0);
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
      const matchedPrimary =
        (product.colorImages || []).find((ci) => ci.image === product.image)?.color ||
        product.colorImages?.[0]?.color ||
        "";
      setPrimaryColor(matchedPrimary);
    } else {
      setEditingProduct(null);
      reset({
        name: "",
        slug: "",
        category: "",
        subCategory: "",
        brand: "",
        price: 0,
        discountPrice: 0,
        countInStock: 0,
        description: "",
        dimensions: "",
        weight: "",
        hsCode: "",
        parentCategory: "detail",
        productType: "local",
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
    const url = "/api/supplier/products";
    const method = editingProduct ? "PUT" : "POST";
    const colorImagesArray = colors
      .filter((color) => colorImages[color])
      .map((color) => ({
        color,
        image: colorImages[color],
        hex: dbColors.find((c) => c.name === color)?.hex || "",
      }));
    const primaryImage =
      (primaryColor && colorImages[primaryColor]) ||
      (colors.find((c) => colorImages[c]) ? colorImages[colors.find((c) => colorImages[c])!] : "");
    const body = editingProduct
      ? { ...data, _id: editingProduct._id, image: primaryImage, sizes, colors, colorImages: colorImagesArray }
      : { ...data, image: primaryImage, sizes, colors, colorImages: colorImagesArray };
    if (!data.slug) {
      body.slug = data.name
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
    }
    setSaving(true);
    try {
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setShowModal(false);
        fetchProducts(currentPage, searchQuery, statusFilter);
      } else {
        const err = await res.json();
        alert(err.message || "Failed to save product");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert("An error occurred while saving the product");
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await apiFetch(`/api/supplier/products?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchProducts(currentPage, searchQuery, statusFilter);
      } else {
        const err = await res.json();
        alert(err.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-black text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-1 uppercase tracking-widest">
            <CheckCircle size={10} /> Approved
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-black text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 uppercase tracking-widest">
            <Clock size={10} /> Pending
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-black text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 uppercase tracking-widest">
            <XCircle size={10} /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const isApproved = supplierStatus === "approved";

  return (
    <div className="space-y-4 md:space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
            My <span className="text-accent">Products</span>
          </h1>
          <p className="text-white/30 font-bold uppercase tracking-widest text-[10px] mt-1">
            Manage your product listings
          </p>
        </div>
        <button
          onClick={() => openModal()}
          disabled={!isApproved}
          className={`inline-flex items-center gap-2 px-5 py-2.5 font-black text-xs uppercase tracking-widest transition-all ${
            isApproved
              ? "bg-accent hover:bg-accent/80 text-primary cursor-pointer"
              : "bg-white/10 text-white/20 cursor-not-allowed"
          }`}
        >
          <Plus size={14} /> Add Product
        </button>
      </div>

      {!isApproved && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 flex items-center gap-3">
          <AlertCircle size={16} className="text-yellow-400 shrink-0" />
          <p className="text-sm text-yellow-400 font-bold">
            Your account is pending approval. You can view existing products but cannot add new ones until approved.
          </p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white/5 border border-white/10 overflow-hidden">
        <div className="flex flex-col md:flex-row gap-4 p-5 border-b border-white/10">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={15} />
            <input
              className="w-full bg-white/5 border border-white/10 focus:border-accent py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/20 outline-none transition-all"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/5 border border-white/10 focus:border-accent pl-4 pr-10 py-2.5 text-sm text-white outline-none font-bold appearance-none cursor-pointer transition-all"
            >
              <option value="all" className="bg-primary">
                All Status
              </option>
              <option value="approved" className="bg-primary">
                Approved
              </option>
              <option value="pending" className="bg-primary">
                Pending
              </option>
              <option value="rejected" className="bg-primary">
                Rejected
              </option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-5 py-3 text-left text-[9px] font-black uppercase tracking-widest text-white/30">
                      Product
                    </th>
                    <th className="px-5 py-3 text-left text-[9px] font-black uppercase tracking-widest text-white/30">
                      Category
                    </th>
                    <th className="px-5 py-3 text-left text-[9px] font-black uppercase tracking-widest text-white/30">
                      Status
                    </th>
                    <th className="px-5 py-3 text-left text-[9px] font-black uppercase tracking-widest text-white/30">
                      Stock
                    </th>
                    <th className="px-5 py-3 text-right text-[9px] font-black uppercase tracking-widest text-white/30">
                      Price
                    </th>
                    <th className="px-5 py-3 text-right text-[9px] font-black uppercase tracking-widest text-white/30"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map((product) => (
                    <tr key={product._id} className="group hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-12 bg-white/10 shrink-0 overflow-hidden">
                            <Image
                              src={product.image || "/images/placeholder.jpg"}
                              alt={product.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate max-w-[160px]">{product.name}</p>
                            <p className="text-[10px] text-white/30">{product.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[9px] font-black text-accent bg-accent/10 px-2 py-1 uppercase tracking-widest">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {getStatusBadge(product.approvalStatus)}
                        {product.approvalNote && (
                          <p className="text-[10px] text-red-400 mt-1">{product.approvalNote}</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${product.countInStock > 0 ? "bg-green-400" : "bg-red-400"}`}
                          />
                          <span className="text-xs font-bold text-white/60">{product.countInStock}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span
                            className={`text-sm font-black ${product.discountPrice > 0 ? "text-red-400" : "text-accent"}`}
                          >
                            {(product.discountPrice || product.price).toLocaleString()} TND
                          </span>
                          {product.discountPrice > 0 && (
                            <span className="text-[10px] text-white/30 line-through">
                              {product.price.toLocaleString()} TND
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openModal(product)}
                            disabled={!isApproved}
                            className={`p-2 border transition-all ${isApproved ? "border-white/20 text-white/50 hover:border-accent hover:text-accent cursor-pointer" : "border-white/5 text-white/10 cursor-not-allowed"}`}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => deleteProduct(product._id)}
                            disabled={!isApproved}
                            className={`p-2 border transition-all ${isApproved ? "border-white/20 text-white/50 hover:border-red-500 hover:text-red-400 cursor-pointer" : "border-white/5 text-white/10 cursor-not-allowed"}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center">
                        <Package size={32} className="text-white/10 mx-auto mb-3" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
                          No products found
                        </p>
                        {isApproved && (
                          <button
                            onClick={() => openModal()}
                            className="mt-3 text-accent font-bold text-xs hover:underline"
                          >
                            Add your first product
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-white/10 flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1.5 text-xs font-black transition-all ${
                      currentPage === page
                        ? "bg-accent text-primary"
                        : "bg-white/5 border border-white/10 text-white/50 hover:border-accent hover:text-accent"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Product Modal — Stepper */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-primary border border-white/10 w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-8 py-5 border-b border-white/10 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 mt-0.5">
                  Step {safeStep + 1} of {totalSteps} — {steps[safeStep].label}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-white/40 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Progress */}
            <div className="px-8 py-4 border-b border-white/10 shrink-0">
              <div className="flex items-center">
                {steps.map((step, index) => (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center shrink-0">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                          index < safeStep
                            ? "bg-accent text-primary"
                            : index === safeStep
                              ? "bg-accent text-primary ring-4 ring-accent/20"
                              : "bg-white/10 text-white/30"
                        }`}
                      >
                        <step.icon size={12} />
                      </div>
                      <span
                        className={`text-[8px] font-bold uppercase tracking-widest mt-1 ${
                          index <= safeStep ? "text-accent" : "text-white/20"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-px mx-2 transition-all ${index < safeStep ? "bg-accent" : "bg-white/10"}`}
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
                      <h3 className="text-lg font-black text-white mb-1">Product Type</h3>
                      <p className="text-sm text-white/40">Is this a local or international product?</p>
                    </div>
                    <input type="hidden" {...register("productType")} />
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setValue("productType", "local")}
                        className={`p-6 border-2 text-left transition-all cursor-pointer ${
                          productType !== "international"
                            ? "border-accent bg-accent/10"
                            : "border-white/10 hover:border-white/30"
                        }`}
                      >
                        <Package
                          size={28}
                          className={productType !== "international" ? "text-accent" : "text-white/30"}
                        />
                        <p className="font-black text-white mt-4 text-base">Local</p>
                        <p className="text-xs text-white/40 mt-1 leading-relaxed">
                          Products sourced and shipped locally within the country
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setValue("productType", "international")}
                        className={`p-6 border-2 text-left transition-all cursor-pointer ${
                          productType === "international"
                            ? "border-accent bg-accent/10"
                            : "border-white/10 hover:border-white/30"
                        }`}
                      >
                        <Globe
                          size={28}
                          className={productType === "international" ? "text-accent" : "text-white/30"}
                        />
                        <p className="font-black text-white mt-4 text-base">International</p>
                        <p className="text-xs text-white/40 mt-1 leading-relaxed">
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
                      <h3 className="text-lg font-black text-white mb-1">Product Details</h3>
                      <p className="text-sm text-white/40">Basic product information</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/30">
                        Product Name *
                      </label>
                      <input
                        {...register("name", { required: true })}
                        className="w-full bg-white/5 border border-white/10 focus:border-accent p-3 text-sm text-white placeholder:text-white/20 outline-none transition-all"
                        placeholder="e.g. Silk Evening Gown"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/30">
                          Category *
                        </label>
                        <div className="relative">
                          <select
                            {...register("category", { required: true })}
                            className="w-full bg-white/5 border border-white/10 focus:border-accent p-3 pr-10 text-sm text-white outline-none appearance-none transition-all cursor-pointer"
                          >
                            <option value="" className="bg-primary">
                              Select...
                            </option>
                            {categories.map((cat) => (
                              <option key={cat._id} value={cat.name} className="bg-primary">
                                {cat.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={14}
                            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/30">
                          SubCategory *
                        </label>
                        <div className="relative">
                          <select
                            {...register("subCategory", { required: true })}
                            className="w-full bg-white/5 border border-white/10 focus:border-accent p-3 pr-10 text-sm text-white outline-none appearance-none transition-all cursor-pointer"
                          >
                            <option value="" className="bg-primary">
                              Select...
                            </option>
                            {subCategories
                              .filter((sub) => !selectedCategory || sub.parentCategory === selectedCategory)
                              .map((sub) => (
                                <option key={sub._id} value={sub.name} className="bg-primary">
                                  {sub.name}
                                </option>
                              ))}
                          </select>
                          <ChevronDown
                            size={14}
                            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Brand *</label>
                        <div className="relative">
                          <select
                            {...register("brand", { required: true })}
                            className="w-full bg-white/5 border border-white/10 focus:border-accent p-3 pr-10 text-sm text-white outline-none appearance-none transition-all cursor-pointer"
                          >
                            <option value="" className="bg-primary">
                              Select brand...
                            </option>
                            {brands.map((brand) => (
                              <option key={brand._id} value={brand.name} className="bg-primary">
                                {brand.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={14}
                            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/30">
                          Parent Category *
                        </label>
                        <div className="relative">
                          <select
                            {...register("parentCategory", { required: true })}
                            className="w-full bg-white/5 border border-white/10 focus:border-accent p-3 pr-10 text-sm text-white outline-none appearance-none transition-all cursor-pointer"
                          >
                            <option value="detail" className="bg-primary">
                              Detail
                            </option>
                            <option value="gros" className="bg-primary">
                              Gros
                            </option>
                          </select>
                          <ChevronDown
                            size={14}
                            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40"
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
                      <h3 className="text-lg font-black text-white mb-1">Variants</h3>
                      <p className="text-sm text-white/40">Add sizes and colors (optional)</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Sizes</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <select
                            value={selectedSize}
                            onChange={(e) => setSelectedSize(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 focus:border-accent p-3 pr-10 text-sm text-white outline-none appearance-none transition-all cursor-pointer"
                          >
                            <option value="" className="bg-primary">
                              — Select a size —
                            </option>
                            <optgroup label="Clothing" className="bg-primary">
                              {["XS", "S", "M", "L", "XL", "XXL", "XXXL"]
                                .filter((s) => !sizes.includes(s))
                                .map((s) => (
                                  <option key={s} value={s} className="bg-primary">
                                    {s}
                                  </option>
                                ))}
                            </optgroup>
                            <optgroup label="Shoes (EU)" className="bg-primary">
                              {["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47"]
                                .filter((s) => !sizes.includes(s))
                                .map((s) => (
                                  <option key={s} value={s} className="bg-primary">
                                    {s}
                                  </option>
                                ))}
                            </optgroup>
                          </select>
                          <ChevronDown
                            size={14}
                            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40"
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
                          className="bg-accent/10 text-accent px-4 hover:bg-accent/20 transition-all cursor-pointer"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      {sizes.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {sizes.map((size) => (
                            <span
                              key={size}
                              className="bg-white/10 text-white font-bold text-xs px-3 py-1 flex items-center gap-1"
                            >
                              {size}
                              <button
                                type="button"
                                onClick={() => setSizes(sizes.filter((s) => s !== size))}
                                className="text-white/30 hover:text-red-400 cursor-pointer"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Colors</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <select
                            value={selectedDbColor}
                            onChange={(e) => setSelectedDbColor(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 focus:border-accent p-3 pr-10 text-sm text-white outline-none appearance-none transition-all cursor-pointer"
                          >
                            <option value="" className="bg-primary">
                              — Select a color —
                            </option>
                            {dbColors
                              .filter((c) => !colors.includes(c.name))
                              .map((c) => (
                                <option key={c._id} value={c.name} className="bg-primary">
                                  {c.name} ({c.hex})
                                </option>
                              ))}
                          </select>
                          <ChevronDown
                            size={14}
                            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40"
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
                          className="bg-accent/10 text-accent px-4 hover:bg-accent/20 transition-all cursor-pointer"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      {colors.length > 0 && (
                        <div className="space-y-2 mt-2">
                          {colors.map((color) => (
                            <div
                              key={color}
                              className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2"
                            >
                              <span className="flex-1 text-white font-bold text-xs">{color}</span>
                              {colorImages[color] && (
                                <div className="relative shrink-0">
                                  <div className="w-8 h-8 overflow-hidden border border-white/10">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={colorImages[color]} alt={color} className="w-full h-full object-cover" />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setColorImages((prev) => {
                                        const n = { ...prev };
                                        delete n[color];
                                        if (primaryColor === color) setPrimaryColor("");
                                        return n;
                                      })
                                    }
                                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white flex items-center justify-center rounded-full cursor-pointer hover:bg-red-600 transition-colors"
                                  >
                                    <X size={9} />
                                  </button>
                                </div>
                              )}
                              {colorImages[color] && (
                                <button
                                  type="button"
                                  onClick={() => setPrimaryColor(color)}
                                  className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 border transition-all cursor-pointer shrink-0 ${
                                    primaryColor === color
                                      ? "bg-accent text-primary border-accent"
                                      : "border-white/20 text-white/30 hover:border-accent/50 hover:text-white/60"
                                  }`}
                                >
                                  {primaryColor === color ? "✓ Cover" : "Cover"}
                                </button>
                              )}
                              <ImageUpload
                                onSuccess={(url) => {
                                  setColorImages((prev) => ({ ...prev, [color]: url }));
                                  if (!primaryColor) setPrimaryColor(color);
                                }}
                                label={colorImages[color] ? "Change" : "Image"}
                                buttonClassName="text-[9px] font-black uppercase tracking-widest text-accent border border-accent/30 px-2 py-1 hover:bg-accent/10 transition-all cursor-pointer shrink-0"
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
                                }}
                                className="text-white/30 hover:text-red-400 cursor-pointer shrink-0"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step: Pricing */}
                {currentStepId === "pricing" && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-lg font-black text-white mb-1">Pricing & Stock</h3>
                      <p className="text-sm text-white/40">Set price and inventory levels</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/30">
                        Price (TND) *
                      </label>
                      <input
                        type="number"
                        {...register("price", { required: true })}
                        className="w-full bg-white/5 border border-white/10 focus:border-accent p-3 text-sm text-white outline-none transition-all"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/30">
                        Discount Price (TND)
                      </label>
                      <input
                        type="number"
                        {...register("discountPrice")}
                        className="w-full bg-white/5 border border-white/10 focus:border-accent p-3 text-sm text-red-400 outline-none transition-all"
                        placeholder="Optional"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/30">
                        Stock Count *
                      </label>
                      <input
                        type="number"
                        {...register("countInStock", { required: true })}
                        className="w-full bg-white/5 border border-white/10 focus:border-accent p-3 text-sm text-white outline-none transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>
                )}

                {/* Step: Media */}
                {currentStepId === "media" && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-lg font-black text-white mb-1">Media & Details</h3>
                      <p className="text-sm text-white/40">Product image, description and physical specs</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/30">
                        Description *
                      </label>
                      <textarea
                        {...register("description", { required: true })}
                        className="w-full bg-white/5 border border-white/10 focus:border-accent p-3 text-sm text-white placeholder:text-white/20 outline-none transition-all min-h-[120px] resize-none"
                        placeholder="Describe your product..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/30">
                        Dimensions
                      </label>
                      <input
                        {...register("dimensions")}
                        className="w-full bg-white/5 border border-white/10 focus:border-accent p-3 text-sm text-white placeholder:text-white/20 outline-none transition-all"
                        placeholder="e.g. 20x30x10 cm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/30">Weight</label>
                        <input
                          {...register("weight")}
                          className="w-full bg-white/5 border border-white/10 focus:border-accent p-3 text-sm text-white placeholder:text-white/20 outline-none transition-all"
                          placeholder="e.g. 1.5 kg"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/30">HS Code</label>
                        <input
                          {...register("hsCode")}
                          className="w-full bg-white/5 border border-white/10 focus:border-accent p-3 text-sm text-white placeholder:text-white/20 outline-none transition-all"
                          placeholder="e.g. 6204.61"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step: Shipping (international only) */}
                {currentStepId === "shipping" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-black text-white mb-1">Shipping Details</h3>
                      <p className="text-sm text-white/40">Required for international products</p>
                    </div>

                    <div className="p-4 bg-accent/5 border border-accent/20 flex items-start gap-3">
                      <Ship size={16} className="text-accent shrink-0 mt-0.5" />
                      <p className="text-xs text-white/60 leading-relaxed">
                        These details are required for customs clearance and logistics planning of international
                        shipments.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/30">
                        CBM — Cubic Meter Volume <span className="text-accent">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        {...register("cbm", {
                          required: "CBM is required for international products",
                          valueAsNumber: true,
                        })}
                        className="w-full bg-white/5 border border-white/10 focus:border-accent p-3 text-sm text-white outline-none transition-all"
                        placeholder="e.g. 0.5"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-white/30">
                        Shipping Time <span className="text-accent">*</span>
                      </label>
                      <input
                        {...register("deliveryTime", {
                          required: "Shipping time is required for international products",
                        })}
                        className="w-full bg-white/5 border border-white/10 focus:border-accent p-3 text-sm text-white placeholder:text-white/20 outline-none transition-all"
                        placeholder="e.g. 15-30 days"
                      />
                    </div>
                  </div>
                )}

                {/* Step: Review */}
                {currentStepId === "review" && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-black text-white mb-1">Review & Submit</h3>
                      <p className="text-sm text-white/40">Check your product details before submitting</p>
                    </div>

                    <div className="p-4 bg-blue-500/10 border border-blue-500/20">
                      <p className="text-xs text-blue-400 font-bold">
                        New products and significant edits require admin approval before appearing on the store.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 bg-white/5 border border-white/10">
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">Type</p>
                        <p className="font-bold text-white capitalize">{formData.productType || "local"}</p>
                      </div>

                      <div className="p-4 bg-white/5 border border-white/10">
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">Product</p>
                        <p className="font-bold text-white">{formData.name}</p>
                        <p className="text-sm text-white/40 mt-1">
                          {formData.category} / {formData.subCategory}
                        </p>
                        <p className="text-xs text-white/30 mt-0.5">{formData.brand}</p>
                      </div>

                      <div className="p-4 bg-white/5 border border-white/10">
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">Pricing</p>
                        <p className="font-black text-accent">{Number(formData.price).toLocaleString()} TND</p>
                        {Number(formData.discountPrice) > 0 && (
                          <p className="text-sm text-red-400 mt-0.5">
                            {Number(formData.discountPrice).toLocaleString()} TND discounted
                          </p>
                        )}
                        <p className="text-xs text-white/40 mt-1">Stock: {formData.countInStock} units</p>
                      </div>

                      {(sizes.length > 0 || colors.length > 0) && (
                        <div className="p-4 bg-white/5 border border-white/10">
                          <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">Variants</p>
                          {sizes.length > 0 && <p className="text-sm text-white">Sizes: {sizes.join(", ")}</p>}
                          {colors.length > 0 && <p className="text-sm text-white mt-1">Colors: {colors.join(", ")}</p>}
                        </div>
                      )}

                      {formData.productType === "international" && (
                        <div className="p-4 bg-accent/5 border border-accent/20">
                          <p className="text-[9px] font-black uppercase tracking-widest text-accent/60 mb-2">
                            Shipping (International)
                          </p>
                          <p className="text-sm text-white">CBM: {formData.cbm}</p>
                          <p className="text-sm text-white mt-1">Shipping Time: {formData.deliveryTime}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="px-8 py-5 border-t border-white/10 flex gap-3 shrink-0">
                {safeStep > 0 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center gap-2 px-5 py-3 border border-white/10 text-white/50 font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all cursor-pointer"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex items-center gap-2 px-5 py-3 border border-white/10 text-white/50 font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                )}

                {isLastStep ? (
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-accent hover:bg-accent/80 text-primary font-black uppercase text-[10px] tracking-widest py-3 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? "Saving..." : editingProduct ? "Update Product" : "Submit for Approval"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceed()}
                    className="flex-1 bg-accent hover:bg-accent/80 text-primary font-black uppercase text-[10px] tracking-widest py-3 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Next <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
