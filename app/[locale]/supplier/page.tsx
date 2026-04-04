"use client";

import { apiFetch } from "@/utils/api";
import {
  ArrowUpRight,
  CheckCircle,
  Clock,
  DollarSign,
  Package,
  Search,
  ShoppingCart,
  Star,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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

function OrderStatusBadge({ isPaid, isDelivered }: { isPaid: boolean; isDelivered: boolean }) {
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isApproved = summary?.status === "approved";
  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand || "").toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    {
      label: t("totalRevenue"),
      value: `${summary?.totalRevenue?.toLocaleString() ?? 0} TND`,
      icon: DollarSign,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: t("totalOrders"),
      value: summary?.totalOrders ?? 0,
      icon: ShoppingCart,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: t("totalProducts"),
      value: summary?.totalProducts ?? 0,
      icon: Package,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      label: t("rating"),
      value: summary?.rating ? `${summary.rating.toFixed(1)} / 5` : "—",
      icon: Star,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
    },
  ];

  return (
    <div className="space-y-4 md:space-y-8">
      {justRegistered && (
        <div className="bg-green-500/10 border border-green-500/20 p-4 flex items-center gap-3">
          <CheckCircle size={16} className="text-green-400 shrink-0" />
          <p className="text-sm font-bold text-green-400">{t("successRegistered")}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
            {t("title")} <span className="text-accent">{t("supplierLabel")}</span>
          </h1>
          <p className="text-white/30 font-bold uppercase tracking-widest text-[10px] mt-1">
            {summary?.businessName ?? ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isApproved && (
            <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                {t("statusDelivered")}
              </span>
            </div>
          )}
          {isApproved && (
            <Link
              href="/supplier/products"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/80 text-primary px-5 py-2.5 font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap"
            >
              {t("addProduct")} <ArrowUpRight size={14} />
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-5 hover:border-accent/30 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.bg} ${stat.color} p-3`}>
                <stat.icon size={20} />
              </div>
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Products Table */}
      <div className="bg-white/5 border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 gap-4">
          <h2 className="text-sm font-black text-white shrink-0">{t("productCol")}</h2>
          <div className="relative w-full max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full bg-white/5 border border-white/10 focus:border-accent py-2 pl-9 pr-4 text-xs text-white placeholder:text-white/20 outline-none transition-all"
            />
          </div>
        </div>
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
                  <tr key={product._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-12 bg-white/10 shrink-0 overflow-hidden">
                          {product.image && (
                            <Image src={product.image} alt={product.name} fill className="object-cover" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate max-w-[140px]">{product.name}</p>
                          <p className="text-[10px] text-white/30">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <ProductStatusBadge status={product.approvalStatus} />
                    </td>
                    <td className="px-5 py-3 text-center hidden md:table-cell">
                      <span className="text-sm font-bold text-white/60">{product.countInStock}</span>
                    </td>
                    <td className="px-5 py-3 text-center hidden md:table-cell">
                      <span className="text-xs text-white/40">{product.brand}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-sm font-black text-accent">{product.price.toLocaleString()} TND</span>
                    </td>
                    <td className="px-5 py-3 text-right hidden lg:table-cell">
                      <span className="text-sm font-bold text-white/40">{product.numSales}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href="/supplier/products"
                        className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 border border-white/20 text-white/50 hover:border-accent hover:text-accent transition-all"
                      >
                        {t("viewBtn")}
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-white/30 text-sm">
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
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <h2 className="text-sm font-black text-white">{t("recentOrders")}</h2>
          </div>
          <Link
            href="/supplier/orders"
            className="text-[9px] font-black uppercase tracking-widest text-accent hover:text-white transition-colors"
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
                  <tr key={order._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-xs font-bold text-white/80 font-mono">#{order._id.slice(-6).toUpperCase()}</p>
                      <p className="text-[10px] text-white/30 mt-0.5">
                        {order.itemCount} {t("articles")}
                      </p>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <p className="text-xs text-white/40">{new Date(order.createdAt).toLocaleDateString("fr-TN")}</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="text-sm font-black text-accent">{order.totalPrice.toFixed(2)} TND</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <OrderStatusBadge isPaid={order.isPaid} isDelivered={order.isDelivered} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center">
                    <CheckCircle size={24} className="text-green-400/40 mx-auto mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{t("noOrders")}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commission Info */}
      {summary && summary.commissionRate > 0 && (
        <div className="bg-white/5 border border-white/10 p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-accent/10 text-accent p-3">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">{t("netRevenue")}</p>
              <p className="text-2xl font-black text-white">{summary.netRevenue.toLocaleString()} TND</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">
              {t("commissionRate")} {summary.commissionRate}%
            </p>
            <p className="text-sm font-black text-red-400">− {summary.commissionAmount.toLocaleString()} TND</p>
          </div>
        </div>
      )}
    </div>
  );
}
