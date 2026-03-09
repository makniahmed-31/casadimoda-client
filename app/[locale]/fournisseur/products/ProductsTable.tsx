"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  X,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import {
  CldUploadWidget,
  CloudinaryUploadWidgetResults,
} from "next-cloudinary";
import { Product, SubCategory, Category, Brand } from "@/types";
import { apiFetch } from "@/utils/api";

interface ProductsResponse {
  products: Product[];
  totalPages: number;
  totalProducts: number;
  currentPage: number;
}

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
  const [sizeInput, setSizeInput] = useState("");
  const [colors, setColors] = useState<string[]>([]);
  const [colorImages, setColorImages] = useState<Record<string, string>>({});
  const [dbColors, setDbColors] = useState<
    { _id: string; name: string; hex: string }[]
  >([]);
  const [selectedDbColor, setSelectedDbColor] = useState("");

  const { register, handleSubmit, reset, setValue, watch } = useForm<Product>();
  const selectedCategory = watch("category");

  // Fetch supplier status
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

  // Fetch products
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

  // Handle search with debounce
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
        subCategory: "",
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

    // First color image is the primary product image
    const primaryImage =
      colors.length > 0 && colorImages[colors[0]]
        ? colorImages[colors[0]]
        : data.image || "";

    const body = editingProduct
      ? {
          ...data,
          _id: editingProduct._id,
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
      const res = await apiFetch(`/api/supplier/products?id=${id}`, {
        method: "DELETE",
      });
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
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-green-700 bg-green-100 px-2 py-1  uppercase tracking-widest">
            <CheckCircle size={12} />
            Approved
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-yellow-700 bg-yellow-100 px-2 py-1  uppercase tracking-widest">
            <Clock size={12} />
            Pending
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-red-700 bg-red-100 px-2 py-1  uppercase tracking-widest">
            <XCircle size={12} />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const isApproved = supplierStatus === "approved";

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-secondary tracking-tighter lowercase">
            My Products<span className="text-accent text-5xl">.</span>
          </h1>
          <p className="text-text-dark/40 font-bold uppercase tracking-widest text-[10px] mt-2">
            Manage your product listings
          </p>
        </div>
        <button
          onClick={() => openModal()}
          disabled={!isApproved}
          className={`px-8 py-4  font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2 transition-all active:scale-95 ${
            isApproved
              ? "bg-primary hover:bg-black text-white cursor-pointer"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <Plus size={16} /> Add New Product
        </button>
      </div>

      {/* Account Status Warning */}
      {!isApproved && (
        <div className="bg-yellow-50 border border-yellow-200  p-4">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-yellow-600" />
            <p className="text-sm text-yellow-800">
              Your account is pending approval. You can view existing products
              but cannot add new ones until approved.
            </p>
          </div>
        </div>
      )}

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
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-secondary border-none  px-6 py-4 outline-none font-bold text-primary appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="pb-6 text-[11px] font-black uppercase tracking-widest text-primary">
                      Product Details
                    </th>
                    <th className="pb-6 text-[11px] font-black uppercase tracking-widest text-primary">
                      Category
                    </th>
                    <th className="pb-6 text-[11px] font-black uppercase tracking-widest text-primary">
                      Status
                    </th>
                    <th className="pb-6 text-[11px] font-black uppercase tracking-widest text-primary">
                      Inventory
                    </th>
                    <th className="pb-6 text-[11px] font-black uppercase tracking-widest text-primary">
                      Price
                    </th>
                    <th className="pb-6 text-[11px] font-black uppercase tracking-widest text-primary text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((product) => (
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
                        {getStatusBadge(product.approvalStatus)}
                        {product.approvalNote && (
                          <p className="text-[10px] text-red-500 mt-1">
                            {product.approvalNote}
                          </p>
                        )}
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
                            {product.countInStock} Units
                          </span>
                        </div>
                      </td>
                      <td className="py-6">
                        <div className="flex flex-col">
                          <span
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
                            <span className="text-[10px] font-bold text-text-dark/30 line-through">
                              ${product.price.toLocaleString("en-US")}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-6 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openModal(product)}
                            disabled={!isApproved}
                            className={`p-3  shadow-sm transition-all ${
                              isApproved
                                ? "bg-secondary text-primary hover:bg-white hover:text-accent cursor-pointer"
                                : "bg-gray-100 text-gray-300 cursor-not-allowed"
                            }`}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => deleteProduct(product._id)}
                            disabled={!isApproved}
                            className={`p-3  shadow-sm transition-all ${
                              isApproved
                                ? "bg-secondary text-primary hover:bg-red-50 hover:text-red-500 cursor-pointer"
                                : "bg-gray-100 text-gray-300 cursor-not-allowed"
                            }`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <Package size={48} className="text-gray-100" />
                          <p className="text-xs font-bold text-text-dark/30 uppercase tracking-[0.2em]">
                            No products found
                          </p>
                          {isApproved && (
                            <button
                              onClick={() => openModal()}
                              className="text-accent font-bold text-sm hover:underline"
                            >
                              Add your first product
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2  font-bold text-sm transition-all ${
                          currentPage === page
                            ? "bg-accent text-white"
                            : "bg-secondary text-primary hover:bg-gray-200"
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl  shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-10 pb-4 flex justify-between items-center bg-white z-10">
              <h2 className="text-3xl font-black text-primary tracking-tight">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-secondary rounded-full transition-all cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            {/* Info Banner */}
            <div className="mx-10 mb-4 p-4 bg-blue-50 border border-blue-200 ">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> New products and significant edits
                require admin approval before they appear on the store.
              </p>
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
                        Product Name *
                      </label>
                      <input
                        {...register("name", { required: true })}
                        className="w-full bg-secondary border-none  p-4 outline-none font-bold text-primary"
                        placeholder="e.g. Silk Evening Gown"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-primary ml-2">
                          Category *
                        </label>
                        <select
                          {...register("category", { required: true })}
                          className="w-full bg-secondary border-none  p-4 outline-none font-bold text-primary appearance-none"
                        >
                          <option value="">Select category...</option>
                          {categories.map((cat) => (
                            <option key={cat._id} value={cat.name}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-primary ml-2">
                          SubCategory *
                        </label>
                        <select
                          {...register("subCategory", { required: true })}
                          className="w-full bg-secondary border-none  p-4 outline-none font-bold text-primary appearance-none"
                        >
                          <option value="">Select subcategory...</option>
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
                        Brand *
                      </label>
                      <select
                        {...register("brand", { required: true })}
                        className="w-full bg-secondary border-none  p-4 outline-none font-bold text-primary appearance-none"
                      >
                        <option value="">Select brand...</option>
                        {brands.map((brand) => (
                          <option key={brand._id} value={brand.name}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-primary ml-2">
                        Parent Category *
                      </label>
                      <select
                        {...register("parentCategory", { required: true })}
                        className="w-full bg-secondary border-none  p-4 outline-none font-bold text-primary appearance-none"
                      >
                        <option value="detail">Detail</option>
                        <option value="gros">Gros</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase tracking-widest text-primary ml-2">
                        Sizes
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
                          placeholder="e.g. S, M, L, XL"
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
                        Colors
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={selectedDbColor}
                          onChange={(e) => setSelectedDbColor(e.target.value)}
                          className="flex-1 bg-secondary border-none p-4 outline-none font-bold text-primary appearance-none"
                        >
                          <option value="">— Select a color —</option>
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
                                    {colorImages[color] ? "Changer" : "Image"}
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
                          Price *
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
                          Discount Price
                        </label>
                        <input
                          type="number"
                          {...register("discountPrice")}
                          className="w-full bg-secondary border-none  p-4 outline-none font-bold text-red-500"
                          placeholder="Optional"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-primary ml-2">
                          In Stock *
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
                        Description *
                      </label>
                      <textarea
                        {...register("description", { required: true })}
                        className="w-full bg-secondary border-none  p-4 outline-none font-bold text-primary min-h-[120px]"
                        placeholder="Describe your product..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-primary ml-2">
                          Delivery Time
                        </label>
                        <input
                          {...register("deliveryTime")}
                          className="w-full bg-secondary border-none  p-4 outline-none font-bold text-primary"
                          placeholder="e.g. 3-5 days"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-primary ml-2">
                          Dimensions
                        </label>
                        <input
                          {...register("dimensions")}
                          className="w-full bg-secondary border-none  p-4 outline-none font-bold text-primary"
                          placeholder="e.g. 20x30x10 cm"
                        />
                      </div>
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
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-primary text-white font-black uppercase text-[10px] tracking-widest py-6  shadow-xl hover:bg-black transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving
                    ? "Saving..."
                    : editingProduct
                      ? "Update Product"
                      : "Submit for Approval"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
