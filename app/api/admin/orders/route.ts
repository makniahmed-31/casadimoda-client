import db from "@/utils/db";
import Order from "@/models/Order";
import { getServerSession } from "next-auth/next";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // "active" | "paid" | "delivered" | "all"
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");

  await db.connect();

  const filter: Record<string, unknown> = {};
  if (status === "active") {
    filter.isDelivered = false;
    filter.isCancelled = { $ne: true };
  } else if (status === "paid") {
    filter.isPaid = true;
    filter.isDelivered = false;
    filter.isCancelled = { $ne: true };
  } else if (status === "delivered") {
    filter.isDelivered = true;
    filter.isCancelled = { $ne: true };
  } else if (status === "cancelled") {
    filter.isCancelled = true;
  }

  const totalOrders = await Order.countDocuments(filter);
  const activeCount = await Order.countDocuments({ isDelivered: false, isCancelled: { $ne: true } });
  const cancelledCount = await Order.countDocuments({ isCancelled: true });

  const orders = await Order.find(filter)
    .populate("user", "name email")
    .populate("transporter", "name email")
    .sort({ createdAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean();

  const serialized = orders.map((o) => ({
    _id: o._id.toString(),
    user: o.user
      ? { _id: (o.user as { _id: { toString(): string }; name?: string; email?: string })._id.toString(), name: (o.user as { name?: string }).name, email: (o.user as { email?: string }).email }
      : null,
    orderItems: o.orderItems,
    shippingAddress: o.shippingAddress,
    paymentMethod: o.paymentMethod,
    totalPrice: o.totalPrice,
    isPaid: o.isPaid,
    isDelivered: o.isDelivered,
    transporter: o.transporter
      ? { _id: (o.transporter as { _id: { toString(): string }; name?: string; email?: string })._id.toString(), name: (o.transporter as { name?: string }).name, email: (o.transporter as { email?: string }).email }
      : null,
    isCancelled: o.isCancelled || false,
    cancellationReason: o.cancellationReason || null,
    cancelledBy: o.cancelledBy || null,
    paidAt: o.paidAt?.toString() || null,
    deliveredAt: o.deliveredAt?.toString() || null,
    cancelledAt: o.cancelledAt?.toString() || null,
    createdAt: o.createdAt?.toString(),
  }));

  return NextResponse.json({
    orders: serialized,
    totalOrders,
    activeCount,
    cancelledCount,
    pages: Math.ceil(totalOrders / pageSize),
  });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { orderId, isPaid, isDelivered, isCancelled, cancellationReason, transporterId } = await req.json();
  if (!orderId) {
    return NextResponse.json({ message: "orderId required" }, { status: 400 });
  }

  await db.connect();

  const update: Record<string, unknown> = {};
  if (typeof isPaid === "boolean") {
    update.isPaid = isPaid;
    if (isPaid) update.paidAt = new Date();
  }
  if (typeof isDelivered === "boolean") {
    update.isDelivered = isDelivered;
    if (isDelivered) update.deliveredAt = new Date();
  }
  if (transporterId !== undefined) {
    update.transporter = transporterId || null;
  }
  if (typeof isCancelled === "boolean") {
    update.isCancelled = isCancelled;
    if (isCancelled) {
      update.cancelledAt = new Date();
      update.cancelledBy = "admin";
      update.cancellationReason = cancellationReason || "";
    }
  }

  const order = await Order.findByIdAndUpdate(orderId, update, { new: true });
  if (!order) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Order updated" });
}
