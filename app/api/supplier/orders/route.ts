import db from "@/utils/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // "active" | "paid" | "delivered" | "all"
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");

  await db.connect();

  const user = await User.findOne({ email: session.user.email });
  if (!user?.supplierId) {
    return NextResponse.json({ message: "Supplier not found" }, { status: 404 });
  }

  // Get all product names belonging to this supplier
  const supplierProducts = await Product.find({ supplier: user.supplierId }).select("name").lean();
  const productNames = supplierProducts.map((p) => p.name);

  if (productNames.length === 0) {
    return NextResponse.json({ orders: [], totalOrders: 0, activeCount: 0, pages: 1 });
  }

  // Base filter: orders containing at least one of supplier's products
  const baseFilter = { "orderItems.name": { $in: productNames } };

  // Status filter
  const statusFilter: Record<string, unknown> = { ...baseFilter };
  if (status === "active") statusFilter.isDelivered = false;
  else if (status === "paid") { statusFilter.isPaid = true; statusFilter.isDelivered = false; }
  else if (status === "delivered") statusFilter.isDelivered = true;

  const totalOrders = await Order.countDocuments(statusFilter);
  const activeCount = await Order.countDocuments({ ...baseFilter, isDelivered: false });

  const orders = await Order.find(statusFilter)
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean();

  const serialized = orders.map((o) => ({
    _id: o._id.toString(),
    user: o.user
      ? {
          _id: (o.user as { _id: { toString(): string } })._id.toString(),
          name: (o.user as { name?: string }).name,
          email: (o.user as { email?: string }).email,
        }
      : null,
    // Only include items that belong to this supplier
    orderItems: o.orderItems.filter((item: { name: string }) => productNames.includes(item.name)),
    shippingAddress: o.shippingAddress,
    paymentMethod: o.paymentMethod,
    totalPrice: o.orderItems
      .filter((item: { name: string; price: number; quantity: number }) => productNames.includes(item.name))
      .reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0),
    isPaid: o.isPaid,
    isDelivered: o.isDelivered,
    paidAt: o.paidAt?.toString() || null,
    deliveredAt: o.deliveredAt?.toString() || null,
    createdAt: o.createdAt?.toString(),
  }));

  return NextResponse.json({ orders: serialized, totalOrders, activeCount, pages: Math.ceil(totalOrders / pageSize) });
}
