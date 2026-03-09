"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { ShoppingBag, Package, CheckCircle, Clock, Truck, XCircle } from "lucide-react";
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
  isCancelled: boolean;
  isConfirmedByClient?: boolean;
  cancellationReason?: string;
  cancelledBy?: string;
  paidAt?: string;
  deliveredAt?: string;
  createdAt: string;
}

export default function OrdersPage() {
  const t = useTranslations("orders");
  const tn = useTranslations("nav");
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelForms, setCancelForms] = useState<Record<string, boolean>>({});
  const [cancelReasons, setCancelReasons] = useState<Record<string, string>>({});
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const fetchOrders = () => {
    apiFetch("/api/user/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") fetchOrders();
  }, [status, router]);

  const handleConfirmReception = async (orderId: string) => {
    setConfirmingId(orderId);
    try {
      const res = await apiFetch("/api/user/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, confirmReception: true }),
      });
      if (res.ok) fetchOrders();
    } finally {
      setConfirmingId(null);
    }
  };

  const handleCancel = async (orderId: string) => {
    setCancellingId(orderId);
    try {
      const res = await apiFetch("/api/user/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, cancellationReason: cancelReasons[orderId] || "" }),
      });
      if (res.ok) {
        setCancelForms((prev) => ({ ...prev, [orderId]: false }));
        fetchOrders();
      }
    } finally {
      setCancellingId(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div
        className="min-h-[calc(100dvh-var(--header-height,80px))] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: "url('/bgg.webp')" }}
      >
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-[calc(100dvh-var(--header-height,80px))] bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/bgg.webp')" }}
    >
      {/* Breadcrumb */}
      <div className="px-8 md:px-16 pt-8">
        <p className="text-white/40 text-xs">
          <Link href="/" className="hover:text-accent transition-colors">
            {tn("home")}
          </Link>
          <span className="mx-2">&gt;</span>
          <span className="text-white/60">{t("title")}</span>
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-12 py-10">
        <div className="flex items-end justify-between mb-10">
          <h1 className="font-serif text-5xl md:text-6xl font-bold italic text-white">
            {t("title")}
          </h1>
          {session?.user && (
            <p className="text-white/30 text-xs hidden md:block">
              {orders.length !== 1
                ? t("countPlural", { count: orders.length })
                : t("count", { count: orders.length })}
            </p>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 border border-white/10 bg-white/5 flex items-center justify-center mb-6">
              <ShoppingBag className="w-8 h-8 text-accent/40" />
            </div>
            <h2 className="font-serif text-3xl font-bold italic text-white mb-3">
              {t("empty")}
            </h2>
            <p className="text-white/40 text-sm mb-8">{t("emptyDesc")}</p>
            <Link
              href="/products"
              className="bg-accent text-primary px-10 py-4 font-black uppercase text-xs tracking-[0.2em] hover:bg-accent/80 transition-all"
            >
              {t("explore")}
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-black/40 border border-white/10"
              >
                {/* Order Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 border-b border-white/10">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-0.5">
                        {t("order")}
                      </p>
                      <p className="text-xs font-bold text-white/60 font-mono">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <div>
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
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-0.5">
                        {t("total")}
                      </p>
                      <p className="text-xs font-black text-accent">
                        {order.totalPrice.toLocaleString()} TND
                      </p>
                    </div>
                  </div>

                  {/* Status badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {order.isCancelled ? (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border border-red-500/30 bg-red-500/10 text-red-400">
                        <XCircle className="w-3 h-3" />
                        {t("cancelled")}
                      </span>
                    ) : (
                      <>
                        <span className={`flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border ${order.isPaid ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"}`}>
                          {order.isPaid ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {order.isPaid ? t("paid") : t("pending")}
                        </span>
                        <span className={`flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border ${order.isDelivered ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-blue-500/30 bg-blue-500/10 text-blue-400"}`}>
                          {order.isDelivered ? <CheckCircle className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
                          {order.isDelivered ? t("delivered") : t("inProgress")}
                        </span>
                        {order.isDelivered && !order.isConfirmedByClient && (
                          <button
                            disabled={confirmingId === order._id}
                            onClick={() => handleConfirmReception(order._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border border-accent/30 bg-accent/10 text-accent hover:bg-accent/20 transition-all cursor-pointer disabled:opacity-40"
                          >
                            <CheckCircle className="w-3 h-3" />
                            {t("confirmReception")}
                          </button>
                        )}
                        {order.isDelivered && order.isConfirmedByClient && (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border border-accent/20 bg-accent/5 text-accent/60">
                            <CheckCircle className="w-3 h-3" /> {t("receptionConfirmed")}
                          </span>
                        )}
                        {!order.isPaid && !order.isDelivered && (
                          <button
                            onClick={() => setCancelForms((p) => ({ ...p, [order._id]: !p[order._id] }))}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border border-red-500/20 bg-red-500/5 text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer"
                          >
                            <XCircle className="w-3 h-3" />
                            {t("cancel")}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-5">
                  <div className="flex flex-col gap-3">
                    {order.orderItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="relative w-12 h-14 shrink-0 overflow-hidden bg-white/5 border border-white/10">
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
                          <p className="text-[10px] text-white/30 mt-0.5">
                            {t("qty")}: {item.quantity}
                          </p>
                        </div>
                        <p className="text-xs font-black text-accent shrink-0">
                          {(item.price * item.quantity).toLocaleString()} TND
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Shipping info */}
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-start gap-2">
                    <Package className="w-3.5 h-3.5 text-white/30 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-white/30">
                      {order.shippingAddress.fullName} —{" "}
                      {order.shippingAddress.address},{" "}
                      {order.shippingAddress.city}{" "}
                      {order.shippingAddress.postalCode},{" "}
                      {order.shippingAddress.country}
                    </p>
                  </div>

                  {/* Cancellation info */}
                  {order.isCancelled && (
                    <div className="mt-3 p-3 border border-red-500/20 bg-red-500/5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-red-400/70 mb-1">
                        {order.cancelledBy === "admin" ? t("cancelledByAdmin") : t("cancelledByClient")}
                      </p>
                      {order.cancellationReason && (
                        <p className="text-xs text-white/40">{order.cancellationReason}</p>
                      )}
                    </div>
                  )}

                  {/* Cancel form */}
                  {cancelForms[order._id] && !order.isCancelled && (
                    <div className="mt-3 p-4 border border-red-500/20 bg-red-500/5 space-y-3">
                      <p className="text-[9px] font-black uppercase tracking-widest text-red-400/70">
                        {t("cancelReason")}
                      </p>
                      <textarea
                        rows={2}
                        value={cancelReasons[order._id] || ""}
                        onChange={(e) => setCancelReasons((p) => ({ ...p, [order._id]: e.target.value }))}
                        placeholder={t("cancelReasonPlaceholder")}
                        className="w-full bg-white/5 border border-white/10 focus:border-red-500/40 py-2 px-3 text-sm text-white placeholder:text-white/20 outline-none resize-none transition-all"
                      />
                      <div className="flex gap-2">
                        <button
                          disabled={cancellingId === order._id}
                          onClick={() => handleCancel(order._id)}
                          className="bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-400 text-[9px] font-black uppercase tracking-widest px-4 py-2 transition-all cursor-pointer disabled:opacity-40"
                        >
                          {cancellingId === order._id ? "..." : t("confirmCancel")}
                        </button>
                        <button
                          onClick={() => setCancelForms((p) => ({ ...p, [order._id]: false }))}
                          className="text-white/30 hover:text-white/60 text-[9px] font-black uppercase tracking-widest px-4 py-2 transition-all cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
