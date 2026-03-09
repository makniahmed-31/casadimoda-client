import db from "@/utils/db";
import Supplier from "@/models/Supplier";
import Product from "@/models/Product";
import Order from "@/models/Order";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await db.connect();

    const user = await User.findOne({ email: session.user.email });
    if (!user || !user.supplierId) {
      return NextResponse.json(
        { message: "Supplier profile not found" },
        { status: 404 },
      );
    }

    const supplier = await Supplier.findById(user.supplierId);
    if (!supplier) {
      return NextResponse.json(
        { message: "Supplier profile not found" },
        { status: 404 },
      );
    }

    // Get product statistics
    const totalProducts = await Product.countDocuments({
      supplier: supplier._id,
    });
    const approvedProducts = await Product.countDocuments({
      supplier: supplier._id,
      approvalStatus: "approved",
    });
    const pendingProducts = await Product.countDocuments({
      supplier: supplier._id,
      approvalStatus: "pending",
    });
    const rejectedProducts = await Product.countDocuments({
      supplier: supplier._id,
      approvalStatus: "rejected",
    });

    // Get supplier's product names for order matching
    const supplierProducts = await Product.find({ supplier: supplier._id }).select("name").lean();
    const productNames = supplierProducts.map((p) => p.name);

    // Get orders containing supplier's products
    const orders = productNames.length > 0
      ? await Order.find({ "orderItems.name": { $in: productNames } })
      : [];

    // Calculate revenue from supplier's products
    let totalRevenue = 0;
    let totalOrders = 0;
    const orderSet = new Set();

    for (const order of orders) {
      if (order.isPaid) {
        for (const item of order.orderItems) {
          if (productNames.includes(item.name)) {
            totalRevenue += item.price * item.quantity;
          }
        }
        if (!orderSet.has(order._id.toString())) {
          orderSet.add(order._id.toString());
          totalOrders++;
        }
      }
    }

    // Get recent orders
    const recentOrders = productNames.length > 0
      ? await Order.find({ "orderItems.name": { $in: productNames } })
          .sort({ createdAt: -1 })
          .limit(5)
          .lean()
      : [];

    // Calculate commissions
    const commissionRate = supplier.commissionRate || 15;
    const commissionAmount = totalRevenue * (commissionRate / 100);
    const netRevenue = totalRevenue - commissionAmount;

    return NextResponse.json({
      status: supplier.status,
      businessName: supplier.businessName,
      totalProducts,
      approvedProducts,
      pendingProducts,
      rejectedProducts,
      totalRevenue,
      totalOrders,
      commissionRate,
      commissionAmount,
      netRevenue,
      rating: supplier.rating,
      numReviews: supplier.numReviews,
      recentOrders: recentOrders.map((order) => ({
        _id: order._id,
        createdAt: order.createdAt,
        totalPrice: order.totalPrice,
        isPaid: order.isPaid,
        isDelivered: order.isDelivered,
        itemCount: order.orderItems.filter(
          (item: { name: string }) => productNames.includes(item.name),
        ).length,
      })),
    });
  } catch (error) {
    console.error("Error fetching supplier summary:", error);
    return NextResponse.json(
      { message: "Error fetching summary" },
      { status: 500 },
    );
  }
}
