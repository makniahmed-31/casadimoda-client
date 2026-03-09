"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Package,
  CheckCircle,
  Clock,
  Truck,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { apiFetch } from "@/utils/api";

interface OrderItem {
  name: string;
  quantity: number;
  image: string;
  price: number;
}

interface Order {
  _id: string;
  user: { _id: string; name?: string; email?: string } | null;
  orderItems: OrderItem[];
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  paidAt?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
}

export default function SupplierOrdersPage() {
  const t = useTranslations("supplierOrders");

  const STATUS_TABS = [
    { key: "active", label: t("active"), color: "text-blue-400" },
    { key: "paid", label: t("paidPending"), color: "text-yellow-400" },
    { key: "delivered", label: t("delivered"), color: "text-green-400" },
    { key: "all", label: t("all"), color: "text-white/60" },
  ];

  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("active");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(
        `/api/supplier/orders?status=${tab}&page=${page}&pageSize=15`,
      );
      const data = await res.json();
      setOrders(data.orders || []);
      setTotalOrders(data.totalOrders || 0);
      setActiveCount(data.activeCount || 0);
      setPages(data.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [tab, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    setPage(1);
  }, [tab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
            {t("title").split(" ")[0]}{" "}
            <span className="text-accent">
              {t("title").split(" ").slice(1).join(" ")}
            </span>
          </h1>
          <p className="text-white/30 font-bold uppercase tracking-widest text-[10px] mt-1">
            {activeCount} {activeCount !== 1 ? t("orders") : t("order")}{" "}
            {activeCount !== 1 ? t("activeOrdersPlural") : t("activeOrders")}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-accent/40 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-accent transition-all cursor-pointer"
        >
          <RefreshCw size={12} />
          {t("refresh")}
        </button>
      </div>

      {/* Tabs */}

      <div className="flex gap-1 border-b border-white/10">
        {STATUS_TABS.map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key)}
            className={`px-2 md:px-5 py-1 md:py-3 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border-b-2 -mb-px ${
              tab === tabItem.key
                ? `border-accent ${tabItem.color}`
                : "border-transparent text-white/30 hover:text-white/60"
            }`}
          >
            {tabItem.label}
            {tabItem.key === "active" && activeCount > 0 && (
              <span className="ml-2 bg-accent text-primary text-[8px] font-black px-1.5 py-0.5">
                {activeCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package size={40} className="text-white/10 mb-4" />
          <p className="text-white/30 text-sm font-bold uppercase tracking-widest">
            {t("noOrders")}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
            >
              {/* Row */}
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 px-5 py-4 cursor-pointer items-start lg:items-center"
                onClick={() =>
                  setExpandedId(expandedId === order._id ? null : order._id)
                }
              >
                <div className="col-span-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-0.5">
                    {t("order")}
                  </p>
                  <p className="text-xs font-bold text-white/70 font-mono">
                    #{order._id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <div className="col-span-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-0.5">
                    {t("client")}
                  </p>
                  <p className="text-xs font-bold text-white truncate">
                    {order.user?.name || order.shippingAddress.fullName}
                  </p>
                </div>
                <div className="col-span-2 hidden md:block">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-0.5">
                    {t("date")}
                  </p>
                  <p className="text-xs text-white/60">
                    {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-0.5">
                    {t("total")}
                  </p>
                  <p className="text-xs font-black text-accent">
                    {order.totalPrice.toLocaleString()} TND
                  </p>
                </div>
                <div className="col-span-2 flex flex-col gap-1">
                  <span
                    className={`flex items-center gap-1 text-[8px] font-black px-2 py-1 w-fit ${order.isPaid ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"}`}
                  >
                    {order.isPaid ? (
                      <CheckCircle size={9} />
                    ) : (
                      <Clock size={9} />
                    )}
                    {order.isPaid ? t("paid") : t("waiting")}
                  </span>
                  <span
                    className={`flex items-center gap-1 text-[8px] font-black px-2 py-1 w-fit ${order.isDelivered ? "bg-green-500/10 text-green-400" : "bg-blue-500/10 text-blue-400"}`}
                  >
                    {order.isDelivered ? (
                      <CheckCircle size={9} />
                    ) : (
                      <Truck size={9} />
                    )}
                    {order.isDelivered ? t("delivered") : t("inProgress")}
                  </span>
                </div>
                <div className="col-span-1 flex justify-end">
                  {expandedId === order._id ? (
                    <ChevronUp size={16} className="text-white/30" />
                  ) : (
                    <ChevronDown size={16} className="text-white/30" />
                  )}
                </div>
              </div>

              {/* Expanded */}
              {expandedId === order._id && (
                <div className="border-t border-white/10 px-5 py-5 space-y-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-3">
                      {t("yourItems")}
                    </p>
                    <div className="space-y-2">
                      {order.orderItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="relative w-10 h-12 shrink-0 bg-white/5 overflow-hidden">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-white/30">
                              {t("qty")}: {item.quantity} ×{" "}
                              {item.price.toLocaleString()} TND
                            </p>
                          </div>
                          <p className="text-xs font-black text-accent">
                            {(item.price * item.quantity).toLocaleString()} TND
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-3 border-t border-white/10">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">
                      {t("delivery")}
                    </p>
                    <p className="text-xs text-white/60">
                      {order.shippingAddress.fullName} —{" "}
                      {order.shippingAddress.address},{" "}
                      {order.shippingAddress.city}{" "}
                      {order.shippingAddress.postalCode},{" "}
                      {order.shippingAddress.country}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
            {t("page")} {page} / {pages} — {totalOrders} {t("orders")}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 bg-white/5 border border-white/10 text-xs font-bold text-white/60 hover:border-accent/40 hover:text-accent disabled:opacity-30 cursor-pointer transition-all"
            >
              {t("prev")}
            </button>
            <button
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 bg-white/5 border border-white/10 text-xs font-bold text-white/60 hover:border-accent/40 hover:text-accent disabled:opacity-30 cursor-pointer transition-all"
            >
              {t("next")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
