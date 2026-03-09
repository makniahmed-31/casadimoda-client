"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Package, Store, CheckCircle, XCircle, Eye } from "lucide-react";
import { SupplierAddress } from "@/types";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/utils/api";

interface PendingProduct {
  _id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  discountPrice?: number;
  countInStock: number;
  image: string;
  description: string;
  approvalStatus?: "pending" | "approved" | "rejected";
  supplier?: {
    _id: string;
    businessName: string;
    businessSlug: string;
    contactEmail: string;
  };
}

interface PendingSupplier {
  _id: string;
  businessName: string;
  businessSlug: string;
  businessDescription?: string;
  businessLogo?: string;
  contactPhone: string;
  contactEmail: string;
  address: SupplierAddress;
  taxId?: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  user?: { name: string; email: string };
}

export default function AdminApprovalsPage() {
  const t = useTranslations("admin");
  const [activeTab, setActiveTab] = useState<"products" | "suppliers">(
    "products",
  );
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([]);
  const [pendingSuppliers, setPendingSuppliers] = useState<PendingSupplier[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState<{
    type: "product" | "supplier";
    item: PendingProduct | PendingSupplier;
    action: "approve" | "reject" | "view";
  } | null>(null);
  const [rejectionNote, setRejectionNote] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const [productsRes, suppliersRes] = await Promise.all([
        apiFetch("/api/admin/products/approve?status=pending"),
        apiFetch("/api/admin/suppliers?status=pending"),
      ]);

      if (productsRes.ok) {
        const data = await productsRes.json();
        setPendingProducts(data.products);
      }

      if (suppliersRes.ok) {
        const data = await suppliersRes.json();
        setPendingSuppliers(data.suppliers);
      }
    } catch (error) {
      console.error("Error fetching pending items:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleProductAction = async (action: "approved" | "rejected") => {
    if (!actionModal || actionModal.type !== "product") return;
    setProcessing(true);

    try {
      const res = await apiFetch("/api/admin/products/approve", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: (actionModal.item as PendingProduct)._id,
          status: action,
          approvalNote: rejectionNote,
        }),
      });

      if (res.ok) {
        fetchPending();
        setActionModal(null);
        setRejectionNote("");
      } else {
        const err = await res.json();
        alert(err.message || "Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleSupplierAction = async (action: "approved" | "rejected") => {
    if (!actionModal || actionModal.type !== "supplier") return;
    setProcessing(true);

    try {
      const res = await apiFetch("/api/admin/suppliers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: (actionModal.item as PendingSupplier)._id,
          status: action,
          rejectionReason: rejectionNote,
        }),
      });

      if (res.ok) {
        fetchPending();
        setActionModal(null);
        setRejectionNote("");
      } else {
        const err = await res.json();
        alert(err.message || "Failed to update supplier");
      }
    } catch (error) {
      console.error("Error updating supplier:", error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-secondary tracking-tighter lowercase">
          {t("approvalsTitle")}
          <span className="text-accent text-5xl">.</span>
        </h1>
        <p className="text-text-dark/40 font-bold uppercase tracking-widest text-[10px] mt-2">
          {t("approvalsSubtitle")}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          onClick={() => setActiveTab("products")}
          className={`bg-white  p-6 shadow-lg border-2 cursor-pointer transition-all ${
            activeTab === "products"
              ? "border-accent"
              : "border-transparent hover:border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-dark/30">
                {t("pendingProducts")}
              </p>
              <p className="text-3xl md:text-4xl font-black text-primary mt-2">
                {pendingProducts.length}
              </p>
            </div>
            <div className="p-4 bg-yellow-100 ">
              <Package size={28} className="text-yellow-600" />
            </div>
          </div>
        </div>

        <div
          onClick={() => setActiveTab("suppliers")}
          className={`bg-white  p-6 shadow-lg border-2 cursor-pointer transition-all ${
            activeTab === "suppliers"
              ? "border-accent"
              : "border-transparent hover:border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-dark/30">
                {t("pendingSuppliers")}
              </p>
              <p className="text-3xl md:text-4xl font-black text-primary mt-2">
                {pendingSuppliers.length}
              </p>
            </div>
            <div className="p-4 bg-blue-100 ">
              <Store size={28} className="text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white border border-gray-100 shadow-sm overflow-hidden p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeTab === "products" ? (
          <>
            <h2 className="text-xl font-black text-primary mb-6">
              {t("productsAwaitingApproval")}
            </h2>
            {pendingProducts.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle
                  size={48}
                  className="text-green-200 mx-auto mb-4"
                />
                <p className="text-text-dark/40 font-bold">
                  {t("noPendingProducts")}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between p-4 bg-secondary/50 "
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-20  overflow-hidden bg-white">
                        <Image
                          src={product.image || "/images/placeholder.jpg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <p className="font-black text-primary">
                          {product.name}
                        </p>
                        <p className="text-xs text-text-dark/50">
                          by{" "}
                          <span className="font-bold text-accent">
                            {product.supplier?.businessName || "Unknown"}
                          </span>
                        </p>
                        <p className="text-xs text-text-dark/40">
                          ${product.price} · {product.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setActionModal({
                            type: "product",
                            item: product,
                            action: "view",
                          })
                        }
                        className="p-2 bg-white text-primary  hover:bg-gray-100 transition-all"
                        title="View"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() =>
                          setActionModal({
                            type: "product",
                            item: product,
                            action: "approve",
                          })
                        }
                        className="p-2 bg-green-100 text-green-700  hover:bg-green-200 transition-all"
                        title="Approve"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button
                        onClick={() =>
                          setActionModal({
                            type: "product",
                            item: product,
                            action: "reject",
                          })
                        }
                        className="p-2 bg-red-100 text-red-700  hover:bg-red-200 transition-all"
                        title="Reject"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="text-xl font-black text-primary mb-6">
              {t("suppliersAwaitingApproval")}
            </h2>
            {pendingSuppliers.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle
                  size={48}
                  className="text-green-200 mx-auto mb-4"
                />
                <p className="text-text-dark/40 font-bold">
                  {t("noPendingSuppliers")}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingSuppliers.map((supplier) => (
                  <div
                    key={supplier._id}
                    className="flex items-center justify-between p-4 bg-secondary/50 "
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-accent/10  flex items-center justify-center">
                        {supplier.businessLogo ? (
                          <img
                            src={supplier.businessLogo}
                            alt={supplier.businessName}
                            className="w-full h-full object-cover "
                          />
                        ) : (
                          <Store size={20} className="text-accent" />
                        )}
                      </div>
                      <div>
                        <p className="font-black text-primary">
                          {supplier.businessName}
                        </p>
                        <p className="text-xs text-text-dark/50">
                          {supplier.user?.name} · {supplier.contactEmail}
                        </p>
                        <p className="text-xs text-text-dark/40">
                          {supplier.address.city}, {supplier.address.country}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setActionModal({
                            type: "supplier",
                            item: supplier,
                            action: "view",
                          })
                        }
                        className="p-2 bg-white text-primary  hover:bg-gray-100 transition-all"
                        title="View"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() =>
                          setActionModal({
                            type: "supplier",
                            item: supplier,
                            action: "approve",
                          })
                        }
                        className="p-2 bg-green-100 text-green-700  hover:bg-green-200 transition-all"
                        title="Approve"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button
                        onClick={() =>
                          setActionModal({
                            type: "supplier",
                            item: supplier,
                            action: "reject",
                          })
                        }
                        className="p-2 bg-red-100 text-red-700  hover:bg-red-200 transition-all"
                        title="Reject"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg  shadow-2xl p-8">
            {actionModal.action === "view" ? (
              <>
                <h3 className="text-2xl font-black text-primary mb-6">
                  {actionModal.type === "product"
                    ? t("productDetails")
                    : t("supplierDetails")}
                </h3>
                {actionModal.type === "product" ? (
                  <div className="space-y-4">
                    <div className="relative w-full aspect-video  overflow-hidden bg-secondary">
                      <Image
                        src={
                          (actionModal.item as PendingProduct).image ||
                          "/images/placeholder.jpg"
                        }
                        alt={(actionModal.item as PendingProduct).name}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-dark/30">
                        {t("name")}
                      </p>
                      <p className="font-bold text-primary">
                        {(actionModal.item as PendingProduct).name}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-dark/30">
                        {t("description")}
                      </p>
                      <p className="text-sm text-text-dark/70">
                        {(actionModal.item as PendingProduct).description}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-dark/30">
                          {t("price")}
                        </p>
                        <p className="font-bold text-primary">
                          ${(actionModal.item as PendingProduct).price}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-dark/30">
                          {t("stock")}
                        </p>
                        <p className="font-bold text-primary">
                          {(actionModal.item as PendingProduct).countInStock}{" "}
                          {t("units")}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-dark/30">
                        {t("businessName")}
                      </p>
                      <p className="font-bold text-primary">
                        {(actionModal.item as PendingSupplier).businessName}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-dark/30">
                        {t("description")}
                      </p>
                      <p className="text-sm text-text-dark/70">
                        {(actionModal.item as PendingSupplier)
                          .businessDescription || t("noDescription")}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-dark/30">
                        {t("contact")}
                      </p>
                      <p className="font-bold text-primary">
                        {(actionModal.item as PendingSupplier).contactEmail}
                      </p>
                      <p className="text-sm text-text-dark/60">
                        {(actionModal.item as PendingSupplier).contactPhone}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-dark/30">
                        {t("address")}
                      </p>
                      <p className="text-sm text-text-dark/70">
                        {(actionModal.item as PendingSupplier).address.street},{" "}
                        {(actionModal.item as PendingSupplier).address.city},{" "}
                        {
                          (actionModal.item as PendingSupplier).address
                            .postalCode
                        }
                        ,{" "}
                        {(actionModal.item as PendingSupplier).address.country}
                      </p>
                    </div>
                    {(actionModal.item as PendingSupplier).taxId && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-dark/30">
                          {t("taxId")}
                        </p>
                        <p className="font-bold text-primary">
                          {(actionModal.item as PendingSupplier).taxId}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                <button
                  onClick={() => setActionModal(null)}
                  className="mt-6 w-full bg-secondary hover:bg-gray-200 text-primary font-bold py-3  transition-colors"
                >
                  {t("close")}
                </button>
              </>
            ) : actionModal.action === "reject" ? (
              <>
                <h3 className="text-2xl font-black text-primary mb-4">
                  {actionModal.type === "product"
                    ? t("rejectProduct")
                    : t("rejectSupplier")}
                </h3>
                <p className="text-text-dark/60 mb-4">
                  {t("rejectionReasonPrompt")}
                </p>
                <textarea
                  value={rejectionNote}
                  onChange={(e) => setRejectionNote(e.target.value)}
                  placeholder={t("rejectionReasonPlaceholder")}
                  className="w-full bg-secondary  p-4 outline-none font-bold text-primary mb-4"
                  rows={3}
                />
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setActionModal(null);
                      setRejectionNote("");
                    }}
                    className="flex-1 bg-secondary hover:bg-gray-200 text-primary font-bold py-3  transition-colors"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    onClick={() =>
                      actionModal.type === "product"
                        ? handleProductAction("rejected")
                        : handleSupplierAction("rejected")
                    }
                    disabled={processing}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3  transition-colors disabled:opacity-50"
                  >
                    {processing ? t("processing") : t("reject")}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-black text-primary mb-4">
                  {actionModal.type === "product"
                    ? t("approveProduct")
                    : t("approveSupplier")}
                </h3>
                <p className="text-text-dark/60 mb-6">
                  {actionModal.type === "product"
                    ? t("approveProductConfirm")
                    : t("approveSupplierConfirmGeneral")}
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setActionModal(null)}
                    className="flex-1 bg-secondary hover:bg-gray-200 text-primary font-bold py-3  transition-colors"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    onClick={() =>
                      actionModal.type === "product"
                        ? handleProductAction("approved")
                        : handleSupplierAction("approved")
                    }
                    disabled={processing}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3  transition-colors disabled:opacity-50"
                  >
                    {processing ? t("processing") : t("approve")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
