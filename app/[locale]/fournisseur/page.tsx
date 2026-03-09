"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Search, CheckCircle, Clock, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/utils/api";

interface Product {
  _id: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  countInStock: number;
  numSales: number;
  approvalStatus: string;
}

interface Order {
  _id: string;
  createdAt: string;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  itemCount: number;
}

interface SummaryData {
  status: string;
  businessName: string;
  totalProducts: number;
  approvedProducts: number;
  pendingProducts: number;
  rejectedProducts: number;
  totalRevenue: number;
  totalOrders: number;
  commissionRate: number;
  commissionAmount: number;
  netRevenue: number;
  rating: number;
  numReviews: number;
  recentOrders: Order[];
}

function ProductStatusBadge({ status }: { status: string }) {
  const t = useTranslations("supplierDashboard");
  if (status === "approved")
    return (
      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 inline-flex items-center gap-1">
        <CheckCircle size={9} />
        {t("statusDelivered")}
      </span>
    );
  if (status === "pending")
    return (
      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 inline-flex items-center gap-1">
        <Clock size={9} />
        {t("statusInProgress")}
      </span>
    );
  return (
    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 inline-flex items-center gap-1">
      <XCircle size={9} />
      {t("statusRejected")}
    </span>
  );
}

function OrderStatusBadge({
  isPaid,
  isDelivered,
}: {
  isPaid: boolean;
  isDelivered: boolean;
}) {
  const t = useTranslations("supplierDashboard");
  if (isDelivered)
    return (
      <span className="text-[9px] font-black uppercase px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20">
        {t("orderStatusInProgress")}
      </span>
    );
  if (isPaid)
    return (
      <span className="text-[9px] font-black uppercase px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20">
        {t("orderStatusPaid")}
      </span>
    );
  return (
    <span className="text-[9px] font-black uppercase px-2 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
      {t("orderStatusWaiting")}
    </span>
  );
}

export default function SupplierDashboard() {
  const t = useTranslations("supplierDashboard");
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "true";
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, productsRes] = await Promise.all([
          apiFetch("/api/supplier/summary"),
          apiFetch("/api/supplier/products?limit=5"),
        ]);
        if (summaryRes.ok) setSummary(await summaryRes.json());
        if (productsRes.ok) {
          const data = await productsRes.json();
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isApproved = summary?.status === "approved";
  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {justRegistered && (
        <div className="bg-green-500/10 border border-green-500/20 p-4 flex items-center gap-3">
          <CheckCircle size={16} className="text-green-400 shrink-0" />
          <p className="text-sm font-bold text-green-400">
            {t("successRegistered")}
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-black text-white tracking-tight">
          {t("title")} <span className="text-accent">{t("supplierLabel")}</span>
        </h1>
        {isApproved && (
          <Link
            href="/fournisseur/products"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent/80 text-primary px-5 py-2.5 font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap"
          >
            {t("addProduct")}
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full bg-white/5 border border-white/10 focus:border-accent py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/20 outline-none transition-all"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white/5 border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-5 py-3 text-left text-[9px] font-black uppercase tracking-widest text-white/30">
                  {t("productCol")}
                </th>
                <th className="px-5 py-3 text-left text-[9px] font-black uppercase tracking-widest text-white/30 hidden sm:table-cell">
                  {t("statusCol")}
                </th>
                <th className="px-5 py-3 text-center text-[9px] font-black uppercase tracking-widest text-white/30 hidden md:table-cell">
                  {t("stockCol")}
                </th>
                <th className="px-5 py-3 text-center text-[9px] font-black uppercase tracking-widest text-white/30 hidden md:table-cell">
                  {t("brandCol")}
                </th>
                <th className="px-5 py-3 text-right text-[9px] font-black uppercase tracking-widest text-white/30">
                  {t("priceCol")}
                </th>
                <th className="px-5 py-3 text-right text-[9px] font-black uppercase tracking-widest text-white/30 hidden lg:table-cell">
                  {t("salesCol")}
                </th>
                <th className="px-5 py-3 text-right text-[9px] font-black uppercase tracking-widest text-white/30"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length > 0 ? (
                filtered.map((product) => (
                  <tr
                    key={product._id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-12 bg-white/10 shrink-0 overflow-hidden">
                          {product.image && (
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate max-w-[140px]">
                            {product.name}
                          </p>
                          <p className="text-[10px] text-white/30">
                            {product.brand}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <ProductStatusBadge status={product.approvalStatus} />
                    </td>
                    <td className="px-5 py-3 text-center hidden md:table-cell">
                      <span className="text-sm font-bold text-white/60">
                        {product.countInStock}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center hidden md:table-cell">
                      <span className="text-xs text-white/40">
                        {product.brand}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-sm font-black text-accent">
                        {product.price.toLocaleString()} TND
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right hidden lg:table-cell">
                      <span className="text-sm font-bold text-white/40">
                        {product.numSales}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href="/fournisseur/products"
                        className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 border border-white/20 text-white/50 hover:border-accent hover:text-accent transition-all"
                      >
                        {t("viewBtn")}
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-white/30 text-sm"
                  >
                    {search ? t("noProductsFound") : t("noProductsRegistered")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white/5 border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xs font-black text-white uppercase tracking-widest">
            {t("recentOrders")}
          </h2>
          <Link
            href="/fournisseur/products"
            className="text-[10px] font-black uppercase tracking-widest text-accent hover:text-white transition-colors"
          >
            {t("viewAll")}
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-5 py-3 text-left text-[9px] font-black uppercase tracking-widest text-white/20">
                  {t("orderCol")}
                </th>
                <th className="px-5 py-3 text-left text-[9px] font-black uppercase tracking-widest text-white/20 hidden sm:table-cell">
                  {t("productOrderCol")}
                </th>
                <th className="px-5 py-3 text-right text-[9px] font-black uppercase tracking-widest text-white/20">
                  {t("amountCol")}
                </th>
                <th className="px-5 py-3 text-right text-[9px] font-black uppercase tracking-widest text-white/20">
                  {t("statusOrderCol")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {summary?.recentOrders?.length ? (
                summary.recentOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="text-xs font-bold text-white">
                        #{order._id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-[10px] text-white/30 mt-0.5">
                        {order.itemCount} {t("articles")}
                      </p>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <p className="text-xs text-white/40">
                        {new Date(order.createdAt).toLocaleDateString("fr-TN")}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="text-sm font-black text-accent">
                        {order.totalPrice.toFixed(2)} TND
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <OrderStatusBadge
                        isPaid={order.isPaid}
                        isDelivered={order.isDelivered}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-10 text-center text-white/30 text-sm"
                  >
                    {t("noOrders")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
