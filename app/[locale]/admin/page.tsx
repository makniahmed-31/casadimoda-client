"use client";

import { useEffect, useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import Link from "next/link";
import {
  TrendingUp,
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Truck,
  CheckCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/utils/api";

interface SummaryData {
  ordersCount: number;
  productsCount: number;
  usersCount: number;
  totalSales: number;
  salesData: { _id: string; totalSales: number }[];
}

interface ActiveOrder {
  _id: string;
  user: { name?: string; email?: string } | null;
  shippingAddress: { fullName: string; city: string };
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const t = useTranslations("admin");
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const [summaryRes, ordersRes] = await Promise.all([
          apiFetch("/api/admin/summary"),
          apiFetch("/api/admin/orders?status=active&pageSize=5"),
        ]);
        const summaryData = await summaryRes.json();
        const ordersData = await ordersRes.json();
        setSummary(summaryData);
        setActiveOrders(ordersData.orders || []);
        setActiveCount(ordersData.activeCount || 0);
      } catch (err) {
        console.error("Failed to fetch dashboard summary", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  console.log("summary", summary);

  const stats = [
    {
      label: t("totalRevenue"),
      value: `${summary?.totalSales?.toLocaleString()} TND`,
      icon: DollarSign,
      color: "text-accent",
      bg: "bg-accent/10",
      trend: "+12.5%",
      isUp: true,
    },
    {
      label: t("allOrders"),
      value: summary?.ordersCount,
      icon: ShoppingCart,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      trend: "+3.2%",
      isUp: true,
    },
    {
      label: t("boutiqueItems"),
      value: summary?.productsCount,
      icon: Package,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      trend: "-1.5%",
      isUp: false,
    },
    {
      label: t("totalMembers"),
      value: summary?.usersCount,
      icon: Users,
      color: "text-green-400",
      bg: "bg-green-500/10",
      trend: "+8.4%",
      isUp: true,
    },
  ];

  return (
    <div className="space-y-4 md:space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
            {t("dashboardTitle")}
          </h1>
          <p className="text-white/30 font-bold uppercase tracking-widest text-[10px] mt-1">
            {t("dashboardSubtitle")}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
            {t("live")}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/10 p-5 hover:border-accent/30 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.bg} ${stat.color} p-3`}>
                <stat.icon size={20} />
              </div>
              <div
                className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 ${stat.isUp ? "text-green-400 bg-green-500/10" : "text-red-400 bg-red-500/10"}`}
              >
                {stat.isUp ? (
                  <ArrowUpRight size={11} />
                ) : (
                  <ArrowDownRight size={11} />
                )}
                {stat.trend}
              </div>
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">
              {stat.label}
            </p>
            <p className="text-2xl font-black text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Active Orders Panel */}
      <div className="bg-white/5 border border-white/10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <h3 className="text-sm font-black text-white">
              {t("activeOrders")}
            </h3>
            {activeCount > 0 && (
              <span className="bg-blue-500/20 text-blue-400 text-[9px] font-black px-2 py-0.5 border border-blue-500/30">
                {t("activeOrdersPending", { count: activeCount })}
              </span>
            )}
          </div>
          <Link
            href="/admin/orders"
            className="text-[9px] font-black uppercase tracking-widest text-accent hover:text-white transition-colors"
          >
            {t("viewAll")}
          </Link>
        </div>

        {activeOrders.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <CheckCircle size={24} className="text-green-400/40 mx-auto mb-2" />
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
              {t("allOrdersDelivered")}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {activeOrders.map((order) => (
              <div
                key={order._id}
                className="grid grid-cols-12 gap-3 px-6 py-3 hover:bg-white/5 transition-colors items-center"
              >
                <div className="col-span-3">
                  <p className="text-xs font-bold text-white/80 font-mono">
                    #{order._id.slice(-6).toUpperCase()}
                  </p>
                  <p className="text-[10px] text-white/30 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                </div>
                <div className="col-span-4">
                  <p className="text-xs font-bold text-white truncate">
                    {order.user?.name || order.shippingAddress.fullName}
                  </p>
                  <p className="text-[10px] text-white/30 truncate">
                    {order.shippingAddress.city}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-black text-accent">
                    {order.totalPrice.toLocaleString()} TND
                  </p>
                </div>
                <div className="col-span-3 flex flex-col gap-1">
                  <span
                    className={`flex items-center gap-1 text-[8px] font-black px-1.5 py-0.5 w-fit ${order.isPaid ? "text-green-400 bg-green-500/10" : "text-yellow-400 bg-yellow-500/10"}`}
                  >
                    {order.isPaid ? (
                      <CheckCircle size={8} />
                    ) : (
                      <Clock size={8} />
                    )}
                    {order.isPaid ? t("paid") : t("unpaid")}
                  </span>
                  <span className="flex items-center gap-1 text-[8px] font-black px-1.5 py-0.5 w-fit text-blue-400 bg-blue-500/10">
                    <Truck size={8} /> {t("pending")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeCount > 5 && (
          <div className="px-6 py-3 border-t border-white/10">
            <Link
              href="/admin/orders"
              className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-accent transition-colors"
            >
              {t("moreActiveOrders", { count: activeCount - 5 })}
            </Link>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-base font-black text-white">
                {t("revenueTrajectory")}
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1">
                {t("monthlyPerformance")}
              </p>
            </div>
            <select className="bg-white/5 border border-white/10 text-white/60 px-3 py-2 text-xs font-bold outline-none cursor-pointer focus:border-accent transition-colors">
              <option>{t("last6Months")}</option>
              <option>{t("lastYear")}</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary?.salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c9a96e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c9a96e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#ffffff10"
                />
                <XAxis
                  dataKey="_id"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: "#ffffff40" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: "#ffffff40" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "#1a1a1a",
                    border: "1px solid #ffffff20",
                    borderRadius: "0px",
                    fontWeight: "bold",
                    color: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="totalSales"
                  stroke="#c9a96e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/5 border border-white/10 p-6 flex flex-col">
          <div className="mb-6">
            <h3 className="text-base font-black text-white">
              {t("quickActions")}
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1">
              {t("managementGateways")}
            </p>
          </div>

          <div className="space-y-3 flex-1">
            <Link
              href="/admin/products?action=create"
              className="w-full bg-accent hover:bg-accent/80 text-primary text-xs font-black uppercase tracking-[0.2em] py-4 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {t("addNewProduct")} <ArrowUpRight size={14} />
            </Link>
            <Link
              href="/admin/giftcards"
              className="w-full bg-white/5 border border-white/10 hover:border-accent/50 text-white text-xs font-black uppercase tracking-[0.2em] py-4 transition-all flex items-center justify-center cursor-pointer"
            >
              {t("generateGiftCard")}
            </Link>
            <Link
              href="/admin/coupons"
              className="w-full bg-white/5 border border-white/10 hover:border-accent/50 text-white text-xs font-black uppercase tracking-[0.2em] py-4 transition-all flex items-center justify-center cursor-pointer"
            >
              {t("launchDiscountCampaign")}
            </Link>
          </div>

          <div className="mt-6 p-4 bg-accent/5 border border-accent/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-accent" size={16} />
              <span className="text-[10px] font-black text-accent uppercase tracking-widest">
                {t("growth")}
              </span>
            </div>
            <p className="text-xs text-white/40 leading-relaxed">
              {t("growthMessagePre")}{" "}
              <span className="text-accent font-black">24%</span>{" "}
              {t("growthMessagePost")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
