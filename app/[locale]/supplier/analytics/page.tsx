"use client";

import { apiFetch } from "@/utils/api";
import { CheckCircle, Clock, DollarSign, Package, ShoppingCart, TrendingUp, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface SummaryData {
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
}

export default function SupplierAnalyticsPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/supplier/summary")
      .then((r) => r.json())
      .then(setSummary)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const revenueData = [
    { month: "Jan", revenue: 0 },
    { month: "Feb", revenue: 0 },
    { month: "Mar", revenue: 0 },
    { month: "Apr", revenue: summary?.totalRevenue ?? 0 },
  ];

  const productStatusData = [
    { name: "Approved", value: summary?.approvedProducts ?? 0, color: "#22c55e" },
    { name: "Pending", value: summary?.pendingProducts ?? 0, color: "#eab308" },
    { name: "Rejected", value: summary?.rejectedProducts ?? 0, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  const stats = [
    {
      label: "Total Revenue",
      value: `${summary?.totalRevenue?.toLocaleString() ?? 0} TND`,
      icon: DollarSign,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Net Revenue",
      value: `${summary?.netRevenue?.toLocaleString() ?? 0} TND`,
      icon: TrendingUp,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      label: "Total Orders",
      value: summary?.totalOrders ?? 0,
      icon: ShoppingCart,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Total Products",
      value: summary?.totalProducts ?? 0,
      icon: Package,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-4 md:space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
            Analytics <span className="text-accent">Overview</span>
          </h1>
          <p className="text-white/30 font-bold uppercase tracking-widest text-[10px] mt-1">Performance summary</p>
        </div>
      </div>

      {/* Stats */}
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 p-6">
          <div className="mb-6">
            <h3 className="text-base font-black text-white">Revenue Trajectory</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1">Monthly Performance</p>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c9a96e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c9a96e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: "#ffffff40" }}
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#ffffff40" }} />
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
                  dataKey="revenue"
                  stroke="#c9a96e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Status */}
        <div className="bg-white/5 border border-white/10 p-6">
          <div className="mb-6">
            <h3 className="text-base font-black text-white">Product Status</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1">Approval Breakdown</p>
          </div>

          {productStatusData.length > 0 ? (
            <>
              <div className="h-[160px]">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={productStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {productStatusData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#1a1a1a",
                        border: "1px solid #ffffff20",
                        borderRadius: "0px",
                        fontWeight: "bold",
                        color: "#fff",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {[
                  {
                    label: "Approved",
                    value: summary?.approvedProducts ?? 0,
                    icon: CheckCircle,
                    color: "text-green-400",
                  },
                  { label: "Pending", value: summary?.pendingProducts ?? 0, icon: Clock, color: "text-yellow-400" },
                  { label: "Rejected", value: summary?.rejectedProducts ?? 0, icon: XCircle, color: "text-red-400" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className={`flex items-center gap-2 ${item.color}`}>
                      <item.icon size={12} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                    </div>
                    <span className="text-sm font-black text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-white/20">
              <Package size={32} className="mb-2" />
              <p className="text-[10px] font-black uppercase tracking-widest">No products yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Commission Breakdown */}
      <div className="bg-white/5 border border-white/10 p-6">
        <div className="mb-6">
          <h3 className="text-base font-black text-white">Commission Breakdown</h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mt-1">
            Rate: {summary?.commissionRate ?? 0}%
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              label: "Gross Revenue",
              value: `${summary?.totalRevenue?.toLocaleString() ?? 0} TND`,
              color: "text-white",
            },
            {
              label: "Commission Deducted",
              value: `− ${summary?.commissionAmount?.toLocaleString() ?? 0} TND`,
              color: "text-red-400",
            },
            { label: "Net Revenue", value: `${summary?.netRevenue?.toLocaleString() ?? 0} TND`, color: "text-accent" },
          ].map((item) => (
            <div key={item.label} className="bg-white/5 border border-white/10 p-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">{item.label}</p>
              <p className={`text-xl font-black ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
