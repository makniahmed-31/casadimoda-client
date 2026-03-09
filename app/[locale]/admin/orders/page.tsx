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
  XCircle,
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
  isCancelled: boolean;
  cancellationReason?: string | null;
  cancelledBy?: string | null;
  transporter?: { _id: string; name?: string; email?: string } | null;
  paidAt?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
}

interface TransporterCompany {
  companyName?: string;
  phone?: string;
  contactEmail?: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  coverageAreas?: string[];
  logo?: string;
  website?: string;
  trackingUrl?: string;
}

interface Transporter {
  _id: string;
  name?: string;
  email?: string;
  company?: TransporterCompany | null;
}

export default function AdminOrdersPage() {
  const t = useTranslations("admin");

  const STATUS_TABS = [
    { key: "active", label: t("tabActive"), color: "text-blue-400" },
    { key: "paid", label: t("tabPaidPending"), color: "text-yellow-400" },
    { key: "delivered", label: t("tabDelivered"), color: "text-green-400" },
    { key: "cancelled", label: t("tabCancelled"), color: "text-red-400" },
    { key: "all", label: t("tabAllOrders"), color: "text-white/60" },
  ];

  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("active");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [cancelForms, setCancelForms] = useState<Record<string, boolean>>({});
  const [cancelReasons, setCancelReasons] = useState<Record<string, string>>(
    {},
  );
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [assignSelects, setAssignSelects] = useState<Record<string, string>>(
    {},
  );

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(
        `/api/admin/orders?status=${tab}&page=${page}&pageSize=15`,
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
    apiFetch("/api/admin/transporters")
      .then((r) => r.json())
      .then((data) => setTransporters(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Reset page when tab changes
  useEffect(() => {
    setPage(1);
  }, [tab]);

  const updateOrder = async (
    orderId: string,
    update: {
      isPaid?: boolean;
      isDelivered?: boolean;
      isCancelled?: boolean;
      cancellationReason?: string;
      transporterId?: string;
    },
  ) => {
    setUpdatingId(orderId);
    try {
      await apiFetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, ...update }),
      });
      fetchOrders();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
            {t("ordersTitle")}
          </h1>
          <p className="text-white/30 font-bold uppercase tracking-widest text-[10px] mt-1">
            {t("activeOrdersPending", { count: activeCount })}
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
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-2 md:px-5 py-1 md:py-3 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border-b-2 -mb-px ${
              tab === t.key
                ? `border-accent ${t.color}`
                : "border-transparent text-white/30 hover:text-white/60"
            }`}
          >
            {t.label}
            {t.key === "active" && activeCount > 0 && (
              <span className="ml-2 bg-accent text-primary text-[8px] font-black px-1.5 py-0.5">
                {activeCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
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
              {/* Row Summary */}
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 px-5 py-4 cursor-pointer items-start lg:items-center"
                onClick={() =>
                  setExpandedId(expandedId === order._id ? null : order._id)
                }
              >
                {/* ID */}
                <div className="col-span-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-0.5">
                    {t("order")}
                  </p>
                  <p className="text-xs font-bold text-white/70 font-mono">
                    #{order._id.slice(-8).toUpperCase()}
                  </p>
                </div>

                {/* Customer */}
                <div className="col-span-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-0.5">
                    {t("customer")}
                  </p>
                  <p className="text-xs font-bold text-white truncate">
                    {order.user?.name || order.shippingAddress.fullName}
                  </p>
                  <p className="text-[10px] text-white/30 truncate">
                    {order.user?.email || "—"}
                  </p>
                </div>

                {/* Date */}
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

                {/* Total */}
                <div className="col-span-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-0.5">
                    {t("total")}
                  </p>
                  <p className="text-xs font-black text-accent">
                    {order.totalPrice.toLocaleString()} TND
                  </p>
                </div>

                {/* Status badges */}
                <div className="col-span-2 flex flex-col gap-1">
                  {order.isCancelled ? (
                    <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider px-2 py-1 w-fit bg-red-500/10 text-red-400">
                      <XCircle size={9} /> {t("cancelledBadge")}
                    </span>
                  ) : (
                    <>
                      <span
                        className={`flex items-center gap-1 text-[8px] font-black uppercase tracking-wider px-2 py-1 w-fit ${order.isPaid ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"}`}
                      >
                        {order.isPaid ? (
                          <CheckCircle size={9} />
                        ) : (
                          <Clock size={9} />
                        )}
                        {order.isPaid ? t("paid") : t("unpaid")}
                      </span>
                      <span
                        className={`flex items-center gap-1 text-[8px] font-black uppercase tracking-wider px-2 py-1 w-fit ${order.isDelivered ? "bg-green-500/10 text-green-400" : "bg-blue-500/10 text-blue-400"}`}
                      >
                        {order.isDelivered ? (
                          <CheckCircle size={9} />
                        ) : (
                          <Truck size={9} />
                        )}
                        {order.isDelivered ? t("delivered") : t("pending")}
                      </span>
                      {!order.isDelivered &&
                        (order.transporter ? (
                          <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider px-2 py-1 w-fit bg-accent/10 text-accent">
                            <Truck size={9} /> {t("assignedBadge")}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider px-2 py-1 w-fit bg-red-500/10 text-red-400">
                            <Truck size={9} /> {t("unassignedBadge")}
                          </span>
                        ))}
                    </>
                  )}
                </div>

                {/* Expand */}
                <div className="col-span-1 flex justify-end">
                  {expandedId === order._id ? (
                    <ChevronUp size={16} className="text-white/30" />
                  ) : (
                    <ChevronDown size={16} className="text-white/30" />
                  )}
                </div>
              </div>

              {/* Expanded Detail */}
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
                              {t("qty")} {item.quantity} ×{" "}
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

                  {/* Shipping */}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">
                      {t("shippingAddress")}
                    </p>
                    <p className="text-xs text-white/60">
                      {order.shippingAddress.fullName} —{" "}
                      {order.shippingAddress.address},{" "}
                      {order.shippingAddress.city}{" "}
                      {order.shippingAddress.postalCode},{" "}
                      {order.shippingAddress.country}
                    </p>
                    <p className="text-[10px] text-white/30 mt-1">
                      {t("paymentMethod")} {order.paymentMethod}
                    </p>
                  </div>

                  {/* Transporter assignment */}
                  {!order.isCancelled && (
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">
                        {t("assignTransporter")}
                      </p>
                      {order.transporter ? (
                        <div className="flex items-center justify-between p-3 bg-accent/5 border border-accent/20">
                          <div>
                            <p className="text-xs text-accent font-black">
                              ✓{" "}
                              {order.transporter.name ||
                                order.transporter.email}
                            </p>
                            <p className="text-[10px] text-white/40 mt-0.5">
                              {order.transporter.email}
                            </p>
                          </div>
                          <button
                            disabled={updatingId === order._id}
                            onClick={() =>
                              updateOrder(order._id, { transporterId: "" })
                            }
                            className="text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-40"
                          >
                            {t("unassign")}
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <select
                            value={assignSelects[order._id] ?? ""}
                            onChange={(e) =>
                              setAssignSelects((p) => ({
                                ...p,
                                [order._id]: e.target.value,
                              }))
                            }
                            className="flex-1 bg-[#1a1a1a] border border-white/10 focus:border-accent py-2 px-3 text-xs text-white outline-none transition-all [&>option]:bg-[#1a1a1a] [&>option]:text-white"
                          >
                            <option value="">{t("noTransporter")}</option>
                            {transporters.map((tr) => (
                              <option key={tr._id} value={tr._id}>
                                {tr.company?.companyName || tr.name}
                                {tr.company?.phone
                                  ? ` — ${tr.company.phone}`
                                  : ` — ${tr.email}`}
                                {tr.company?.address?.city
                                  ? ` (${tr.company.address.city})`
                                  : ""}
                              </option>
                            ))}
                          </select>
                          <button
                            disabled={
                              updatingId === order._id ||
                              !assignSelects[order._id]
                            }
                            onClick={() =>
                              updateOrder(order._id, {
                                transporterId: assignSelects[order._id] ?? "",
                              })
                            }
                            className="bg-accent/10 border border-accent/30 hover:bg-accent/20 text-accent text-[9px] font-black uppercase tracking-widest px-4 py-2 transition-all cursor-pointer disabled:opacity-40"
                          >
                            {t("assign")}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cancellation info */}
                  {order.isCancelled && (
                    <div className="p-3 border border-red-500/20 bg-red-500/5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-red-400/70 mb-1">
                        {t("cancelledBy")}{" "}
                        {order.cancelledBy === "admin" ? "admin" : "client"}
                      </p>
                      {order.cancellationReason && (
                        <p className="text-xs text-white/40">
                          {order.cancellationReason}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                    {!order.isCancelled && !order.isPaid && (
                      <button
                        disabled={updatingId === order._id}
                        onClick={() => updateOrder(order._id, { isPaid: true })}
                        className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 text-green-400 text-[9px] font-black uppercase tracking-widest px-4 py-2 transition-all cursor-pointer disabled:opacity-40"
                      >
                        <CheckCircle size={11} /> {t("markAsPaid")}
                      </button>
                    )}
                    {!order.isCancelled &&
                      order.isPaid &&
                      !order.isDelivered && (
                        <button
                          disabled={updatingId === order._id}
                          onClick={() =>
                            updateOrder(order._id, { isDelivered: true })
                          }
                          className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest px-4 py-2 transition-all cursor-pointer disabled:opacity-40"
                        >
                          <Truck size={11} /> {t("markAsDelivered")}
                        </button>
                      )}
                    {!order.isCancelled && order.isPaid && (
                      <button
                        disabled={updatingId === order._id}
                        onClick={() =>
                          updateOrder(order._id, { isPaid: false })
                        }
                        className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest px-4 py-2 transition-all cursor-pointer disabled:opacity-40"
                      >
                        {t("revertPayment")}
                      </button>
                    )}
                    {!order.isCancelled && (
                      <button
                        disabled={updatingId === order._id}
                        onClick={() =>
                          setCancelForms((p) => ({
                            ...p,
                            [order._id]: !p[order._id],
                          }))
                        }
                        className="flex items-center ml-auto gap-1.5 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest px-4 py-2 transition-all cursor-pointer disabled:opacity-40"
                      >
                        <XCircle size={11} /> {t("cancelOrder")}
                      </button>
                    )}
                    {updatingId === order._id && (
                      <div className="flex items-center gap-2 text-white/30 text-[9px] font-black uppercase tracking-widest">
                        <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                        {t("updating")}
                      </div>
                    )}
                  </div>

                  {/* Cancel form */}
                  {cancelForms[order._id] && !order.isCancelled && (
                    <div className="p-4 border border-red-500/20 bg-red-500/5 space-y-3">
                      <p className="text-[9px] font-black uppercase tracking-widest text-red-400/70">
                        {t("cancelReason")}
                      </p>
                      <textarea
                        rows={2}
                        value={cancelReasons[order._id] || ""}
                        onChange={(e) =>
                          setCancelReasons((p) => ({
                            ...p,
                            [order._id]: e.target.value,
                          }))
                        }
                        placeholder={t("cancelReasonPlaceholder")}
                        className="w-full bg-white/5 border border-white/10 focus:border-red-500/40 py-2 px-3 text-sm text-white placeholder:text-white/20 outline-none resize-none transition-all"
                      />
                      <div className="flex gap-2">
                        <button
                          disabled={updatingId === order._id}
                          onClick={() => {
                            updateOrder(order._id, {
                              isCancelled: true,
                              cancellationReason:
                                cancelReasons[order._id] || "",
                            });
                            setCancelForms((p) => ({
                              ...p,
                              [order._id]: false,
                            }));
                          }}
                          className="bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-400 text-[9px] font-black uppercase tracking-widest px-4 py-2 transition-all cursor-pointer disabled:opacity-40"
                        >
                          {t("confirmCancel")}
                        </button>
                        <button
                          onClick={() =>
                            setCancelForms((p) => ({
                              ...p,
                              [order._id]: false,
                            }))
                          }
                          className="text-white/30 hover:text-white/60 text-[9px] font-black uppercase tracking-widest px-4 py-2 transition-all cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
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
            Page {page} of {pages} — {totalOrders} orders
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
