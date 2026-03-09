import db from "@/utils/db";
import Order from "@/models/Order";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "active";

  await db.connect();
  const me = await User.findOne({ email: session.user.email }).lean();
  if (!me) return NextResponse.json({ message: "User not found" }, { status: 404 });

  const myId = me._id;
  let filter: Record<string, unknown>;

  if (status === "mine") {
    filter = { isCancelled: { $ne: true }, isDelivered: false, transporter: myId };
  } else if (status === "delivered") {
    filter = { isCancelled: { $ne: true }, isDelivered: true, transporter: myId };
  } else {
    // "active" = unassigned or assigned to me, not yet delivered
    filter = {
      isCancelled: { $ne: true },
      isDelivered: false,
      $or: [{ transporter: null }, { transporter: myId }],
    };
  }

  const orders = await Order.find(filter)
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(80)
    .lean();

  const myIdStr = myId.toString();

  return NextResponse.json(orders.map((o) => ({
    _id: o._id.toString(),
    user: o.user
      ? { name: (o.user as { name?: string }).name, email: (o.user as { email?: string }).email }
      : null,
    orderItems: o.orderItems,
    shippingAddress: o.shippingAddress,
    paymentMethod: o.paymentMethod,
    totalPrice: o.totalPrice,
    isPaid: o.isPaid,
    isDelivered: o.isDelivered,
    isConfirmedByClient: o.isConfirmedByClient || false,
    transporter: o.transporter ? o.transporter.toString() : null,
    isAssignedToMe: o.transporter?.toString() === myIdStr,
    createdAt: o.createdAt?.toString(),
  })));
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { orderId, isPaid, isDelivered, pickOrder, releaseOrder } = await req.json();
  if (!orderId) {
    return NextResponse.json({ message: "orderId required" }, { status: 400 });
  }

  await db.connect();
  const me = await User.findOne({ email: session.user.email }).lean();
  if (!me) return NextResponse.json({ message: "User not found" }, { status: 404 });

  const myId = me._id;
  const order = await Order.findById(orderId);
  if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

  if (pickOrder) {
    if (order.transporter) {
      return NextResponse.json({ message: "Order already assigned" }, { status: 400 });
    }
    order.transporter = myId;
    await order.save();
    return NextResponse.json({ message: "Order picked" });
  }

  if (releaseOrder) {
    if (order.transporter?.toString() !== myId.toString()) {
      return NextResponse.json({ message: "Not your order" }, { status: 403 });
    }
    order.transporter = null;
    await order.save();
    return NextResponse.json({ message: "Order released" });
  }

  // Only allow acting on orders assigned to this transporter
  if (order.transporter?.toString() !== myId.toString()) {
    return NextResponse.json({ message: "Not your order" }, { status: 403 });
  }

  if (typeof isPaid === "boolean") {
    order.isPaid = isPaid;
    if (isPaid) order.paidAt = new Date();
  }
  if (typeof isDelivered === "boolean") {
    order.isDelivered = isDelivered;
    if (isDelivered) order.deliveredAt = new Date();
  }
  await order.save();

  return NextResponse.json({ message: "Order updated" });
}
