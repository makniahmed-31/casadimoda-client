"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  Truck,
  CheckCircle,
  Clock,
  Package,
  RefreshCw,
  MapPin,
  HandshakeIcon,
} from "lucide-react";
import { apiFetch } from "@/utils/api";

interface OrderItem {
  name: string;
  quantity: number;
  image: string;
  price: number;
}
interface Order {
  _id: string;
  user: { name?: string; email?: string } | null;
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
  isConfirmedByClient: boolean;
  transporter: string | null;
  isAssignedToMe: boolean;
  createdAt: string;
}

type Tab = "active" | "mine" | "delivered";

export default function TransporterPage() {
  const t = useTranslations("transporter");
  const { data: session, status } = useSession();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("active");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/transporter/orders?status=${tab}`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    const role = (session?.user as { role?: string })?.role;
    if (
      status === "authenticated" &&
      role !== "transporter" &&
      role !== "admin"
    ) {
      router.push("/");
      return;
    }
    if (status === "authenticated") fetchOrders();
  }, [status, session, router, fetchOrders]);

  const act = async (orderId: string, payload: Record<string, unknown>) => {
    setUpdatingId(orderId);
    try {
      await apiFetch("/api/transporter/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, ...payload }),
      });
      fetchOrders();
    } finally {
      setUpdatingId(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs: { key: Tab; label: string; color: string }[] = [
    { key: "active", label: t("tabActive"), color: "text-blue-400" },
    { key: "mine", label: t("tabMine"), color: "text-accent" },
    { key: "delivered", label: t("tabDelivered"), color: "text-green-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
            {t("deliveries")}
          </h1>
          <p className="text-white/30 font-bold uppercase tracking-widest text-[10px] mt-1">
            {orders.length} {t("ordersCount")}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-accent/40 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-accent transition-all cursor-pointer"
        >
          <RefreshCw size={12} /> {t("refresh")}
        </button>
      </div>

      {/* Tabs */}

      <div className="flex gap-1 border-b border-white/10">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={`px-2 md:px-5 py-1 md:py-3 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border-b-2 -mb-px ${tab === tb.key ? `border-accent ${tb.color}` : "border-transparent text-white/30 hover:text-white/60"}`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* Orders */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package size={40} className="text-white/10 mb-4" />
          <p className="text-white/30 text-sm font-bold uppercase tracking-widest">
            {t("noOrders")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order._id}
              className={`border transition-colors ${order.isAssignedToMe ? "bg-accent/5 border-accent/20" : "bg-white/5 border-white/10 hover:border-white/20"}`}
            >
              {/* Row */}
              <div
                className="grid grid-cols-12 gap-3 px-5 py-4 cursor-pointer items-center"
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
                  <p className="text-[9px] text-white/30 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                </div>
                <div className="col-span-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-0.5">
                    {t("customer")}
                  </p>
                  <p className="text-xs font-bold text-white truncate">
                    {order.shippingAddress.fullName}
                  </p>
                  <p className="text-[9px] text-white/30 truncate">
                    {order.shippingAddress.city}
                  </p>
                </div>
                <div className="col-span-3 hidden md:block">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-0.5">
                    {t("address")}
                  </p>
                  <p className="text-xs text-white/60 truncate">
                    {order.shippingAddress.address}
                  </p>
                  <p className="text-[9px] text-white/40">
                    {order.shippingAddress.postalCode}
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
                  {!order.transporter ? (
                    <span className="text-[8px] font-black uppercase tracking-wider px-2 py-1 w-fit bg-white/5 text-white/40">
                      {t("unassigned")}
                    </span>
                  ) : order.isAssignedToMe ? (
                    <span className="text-[8px] font-black uppercase tracking-wider px-2 py-1 w-fit bg-accent/10 text-accent">
                      {t("myOrder")}
                    </span>
                  ) : (
                    <span className="text-[8px] font-black uppercase tracking-wider px-2 py-1 w-fit bg-white/5 text-white/40">
                      {t("assigned")}
                    </span>
                  )}
                  <span
                    className={`flex items-center gap-1 text-[8px] font-black uppercase tracking-wider px-2 py-1 w-fit ${order.isPaid ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"}`}
                  >
                    {order.isPaid ? (
                      <CheckCircle size={8} />
                    ) : (
                      <Clock size={8} />
                    )}
                    {order.isPaid ? t("paid") : t("cod")}
                  </span>
                </div>
              </div>

              {/* Expanded */}
              {expandedId === order._id && (
                <div className="border-t border-white/10 px-5 py-5 space-y-5">
                  {/* Items */}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-3">
                      {t("items")}
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
                              ×{item.quantity} — {item.price.toLocaleString()}{" "}
                              TND
                            </p>
                          </div>
                          <p className="text-xs font-black text-accent">
                            {(item.price * item.quantity).toLocaleString()} TND
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-accent mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white">
                        {order.shippingAddress.fullName}
                      </p>
                      <p className="text-[10px] text-white/50">
                        {order.shippingAddress.address},{" "}
                        {order.shippingAddress.city}{" "}
                        {order.shippingAddress.postalCode},{" "}
                        {order.shippingAddress.country}
                      </p>
                      <p className="text-[10px] text-white/30 mt-1">
                        {t("paymentMethod")} {order.paymentMethod}
                      </p>
                    </div>
                  </div>

                  {/* Client confirmed badge */}
                  {order.isConfirmedByClient && (
                    <p className="text-[9px] font-black uppercase tracking-widest text-accent/70">
                      ✓ {t("clientConfirmed")}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-white/10">
                    {!order.transporter && (
                      <button
                        disabled={updatingId === order._id}
                        onClick={() => act(order._id, { pickOrder: true })}
                        className="flex items-center gap-1.5 bg-accent/10 border border-accent/30 hover:bg-accent/20 text-accent text-[9px] font-black uppercase tracking-widest px-4 py-2 transition-all cursor-pointer disabled:opacity-40"
                      >
                        <HandshakeIcon size={11} /> {t("pickOrder")}
                      </button>
                    )}
                    {order.isAssignedToMe && !order.isDelivered && (
                      <>
                        <button
                          disabled={updatingId === order._id}
                          onClick={() => act(order._id, { isDelivered: true })}
                          className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest px-4 py-2 transition-all cursor-pointer disabled:opacity-40"
                        >
                          <Truck size={11} /> {t("markDelivered")}
                        </button>
                        {!order.isPaid && (
                          <button
                            disabled={updatingId === order._id}
                            onClick={() => act(order._id, { isPaid: true })}
                            className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 text-green-400 text-[9px] font-black uppercase tracking-widest px-4 py-2 transition-all cursor-pointer disabled:opacity-40"
                          >
                            <CheckCircle size={11} /> {t("markPaid")}
                          </button>
                        )}
                        <button
                          disabled={updatingId === order._id}
                          onClick={() => act(order._id, { releaseOrder: true })}
                          className="ml-auto text-white/20 hover:text-white/50 text-[9px] font-black uppercase tracking-widest px-3 py-2 transition-all cursor-pointer disabled:opacity-40"
                        >
                          {t("release")}
                        </button>
                      </>
                    )}
                    {updatingId === order._id && (
                      <div className="flex items-center gap-2 text-white/30 text-[9px] font-black uppercase tracking-widest">
                        <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                        {t("updating")}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
