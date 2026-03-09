"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Store,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  Eye,
} from "lucide-react";
import { Supplier } from "@/types";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/utils/api";

interface SuppliersResponse {
  suppliers: (Supplier & { user?: { name: string; email: string } })[];
  totalPages: number;
  totalSuppliers: number;
  currentPage: number;
}

export default function AdminSuppliersPage() {
  const t = useTranslations("admin");
  const [suppliers, setSuppliers] = useState<SuppliersResponse["suppliers"]>(
    [],
  );
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionModal, setActionModal] = useState<{
    supplier: SuppliersResponse["suppliers"][0];
    action: string;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchSuppliers = async (page = 1, search = "", status = "all") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        ...(search && { search }),
        ...(status !== "all" && { status }),
      });
      const res = await apiFetch(`/api/admin/suppliers?${params}`);
      if (res.ok) {
        const data: SuppliersResponse = await res.json();
        setSuppliers(data.suppliers);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers(1, searchQuery, statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuppliers(1, searchQuery, statusFilter);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleAction = async (action: string) => {
    if (!actionModal) return;
    setProcessing(true);

    try {
      const body: { id: string; status: string; rejectionReason?: string } = {
        id: actionModal.supplier._id,
        status: action,
      };

      if (action === "rejected" && rejectionReason) {
        body.rejectionReason = rejectionReason;
      }

      const res = await apiFetch("/api/admin/suppliers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        fetchSuppliers(currentPage, searchQuery, statusFilter);
        setActionModal(null);
        setRejectionReason("");
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-green-700 bg-green-100 px-3 py-1  uppercase tracking-widest">
            <CheckCircle size={12} />
            {t("statusApproved")}
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-yellow-700 bg-yellow-100 px-3 py-1  uppercase tracking-widest">
            <Clock size={12} />
            {t("statusPending")}
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-red-700 bg-red-100 px-3 py-1  uppercase tracking-widest">
            <XCircle size={12} />
            {t("statusRejected")}
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black text-gray-700 bg-gray-100 px-3 py-1  uppercase tracking-widest">
            <Ban size={12} />
            {t("statusSuspended")}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-secondary tracking-tighter lowercase">
            {t("suppliersTitle")}
            <span className="text-accent text-5xl">.</span>
          </h1>
          <p className="text-text-dark/40 font-bold uppercase tracking-widest text-[10px] mt-2">
            {t("suppliersSubtitle")}
          </p>
        </div>
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
              placeholder={t("searchSuppliers")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-secondary border-none  px-6 py-4 outline-none font-bold text-primary appearance-none cursor-pointer"
          >
            <option value="all">{t("allStatus")}</option>
            <option value="pending">{t("statusPending")}</option>
            <option value="approved">{t("statusApproved")}</option>
            <option value="rejected">{t("statusRejected")}</option>
            <option value="suspended">{t("statusSuspended")}</option>
          </select>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Suppliers Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="pb-6 text-[11px] font-black uppercase tracking-widest text-primary">
                      {t("business")}
                    </th>
                    <th className="pb-6 text-[11px] font-black uppercase tracking-widest text-primary">
                      {t("contact")}
                    </th>
                    <th className="pb-6 text-[11px] font-black uppercase tracking-widest text-primary">
                      {t("status")}
                    </th>
                    <th className="pb-6 text-[11px] font-black uppercase tracking-widest text-primary">
                      {t("products")}
                    </th>
                    <th className="pb-6 text-[11px] font-black uppercase tracking-widest text-primary">
                      {t("commission")}
                    </th>
                    <th className="pb-6 text-[11px] font-black uppercase tracking-widest text-primary text-right">
                      {t("actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {suppliers.map((supplier) => (
                    <tr
                      key={supplier._id}
                      className="group hover:bg-secondary/10 transition-colors"
                    >
                      <td className="py-6">
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
                            <p className="font-black text-primary text-sm">
                              {supplier.businessName}
                            </p>
                            <p className="text-[10px] font-bold text-text-dark/30 uppercase tracking-widest">
                              {supplier.user?.name || "Unknown"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6">
                        <p className="text-sm font-bold text-primary">
                          {supplier.contactEmail}
                        </p>
                        <p className="text-xs text-text-dark/50">
                          {supplier.contactPhone}
                        </p>
                      </td>
                      <td className="py-6">
                        {getStatusBadge(supplier.status)}
                      </td>
                      <td className="py-6">
                        <span className="text-lg font-black text-primary">
                          {supplier.totalProducts}
                        </span>
                      </td>
                      <td className="py-6">
                        <span className="text-sm font-bold text-primary">
                          {supplier.commissionRate}%
                        </span>
                      </td>
                      <td className="py-6 text-right">
                        <div className="flex justify-end gap-2">
                          {supplier.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  setActionModal({
                                    supplier,
                                    action: "approve",
                                  })
                                }
                                className="p-2 bg-green-100 text-green-700  hover:bg-green-200 transition-all"
                                title="Approve"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() =>
                                  setActionModal({ supplier, action: "reject" })
                                }
                                className="p-2 bg-red-100 text-red-700  hover:bg-red-200 transition-all"
                                title="Reject"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          {supplier.status === "approved" && (
                            <button
                              onClick={() =>
                                setActionModal({ supplier, action: "suspend" })
                              }
                              className="p-2 bg-gray-100 text-gray-700  hover:bg-gray-200 transition-all"
                              title="Suspend"
                            >
                              <Ban size={16} />
                            </button>
                          )}
                          {supplier.status === "suspended" && (
                            <button
                              onClick={() =>
                                setActionModal({
                                  supplier,
                                  action: "reactivate",
                                })
                              }
                              className="p-2 bg-green-100 text-green-700  hover:bg-green-200 transition-all"
                              title="Reactivate"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          <button
                            onClick={() =>
                              setActionModal({ supplier, action: "view" })
                            }
                            className="p-2 bg-secondary text-primary  hover:bg-gray-200 transition-all"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {suppliers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <Store
                          size={48}
                          className="text-gray-100 mx-auto mb-4"
                        />
                        <p className="text-xs font-bold text-text-dark/30 uppercase tracking-[0.2em]">
                          {t("noSuppliers")}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() =>
                        fetchSuppliers(page, searchQuery, statusFilter)
                      }
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
                  {t("supplierDetails")}
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-dark/30">
                      {t("businessName")}
                    </p>
                    <p className="font-bold text-primary">
                      {actionModal.supplier.businessName}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-dark/30">
                      {t("contactEmail")}
                    </p>
                    <p className="font-bold text-primary">
                      {actionModal.supplier.contactEmail}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-dark/30">
                      {t("phone")}
                    </p>
                    <p className="font-bold text-primary">
                      {actionModal.supplier.contactPhone}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-dark/30">
                      {t("address")}
                    </p>
                    <p className="font-bold text-primary">
                      {actionModal.supplier.address.street},{" "}
                      {actionModal.supplier.address.city},{" "}
                      {actionModal.supplier.address.postalCode},{" "}
                      {actionModal.supplier.address.country}
                    </p>
                  </div>
                  {actionModal.supplier.taxId && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-dark/30">
                        {t("taxId")}
                      </p>
                      <p className="font-bold text-primary">
                        {actionModal.supplier.taxId}
                      </p>
                    </div>
                  )}
                </div>
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
                  {t("rejectSupplier")}
                </h3>
                <p className="text-text-dark/60 mb-4">
                  {t("rejectSupplierConfirm", {
                    name: actionModal.supplier.businessName,
                  })}
                </p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder={t("rejectionReasonPlaceholder")}
                  className="w-full bg-secondary  p-4 outline-none font-bold text-primary mb-4"
                  rows={3}
                />
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setActionModal(null);
                      setRejectionReason("");
                    }}
                    className="flex-1 bg-secondary hover:bg-gray-200 text-primary font-bold py-3  transition-colors"
                  >
                    {t("cancel")}
                  </button>
                  <button
                    onClick={() => handleAction("rejected")}
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
                  {actionModal.action === "approve" && t("approveSupplier")}
                  {actionModal.action === "suspend" && t("suspendSupplier")}
                  {actionModal.action === "reactivate" &&
                    t("reactivateSupplier")}
                </h3>
                <p className="text-text-dark/60 mb-6">
                  {actionModal.action === "approve" &&
                    t("approveSupplierConfirm", {
                      name: actionModal.supplier.businessName,
                    })}
                  {actionModal.action === "suspend" &&
                    t("suspendSupplierConfirm", {
                      name: actionModal.supplier.businessName,
                    })}
                  {actionModal.action === "reactivate" &&
                    t("reactivateSupplierConfirm", {
                      name: actionModal.supplier.businessName,
                    })}
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
                      handleAction(
                        actionModal.action === "approve" ||
                          actionModal.action === "reactivate"
                          ? "approved"
                          : "suspended",
                      )
                    }
                    disabled={processing}
                    className={`flex-1 font-bold py-3  transition-colors disabled:opacity-50 ${
                      actionModal.action === "suspend"
                        ? "bg-gray-600 hover:bg-gray-700 text-white"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                  >
                    {processing ? t("processing") : t("confirm")}
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
