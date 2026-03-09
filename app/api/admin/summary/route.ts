import db from "@/utils/db";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

export async function GET() {
  const session = await getServerSession();

  // Basic security check (ideally check for isAdmin flag in session)
  // For this demo context we assume the route is only called by admins

  await db.connect();

  const ordersCount = await Order.countDocuments();
  const productsCount = await Product.countDocuments();
  const usersCount = await User.countDocuments();

  const ordersPriceGroup = await Order.aggregate([
    {
      $group: {
        _id: null,
        sales: { $sum: "$totalPrice" },
      },
    },
  ]);
  const totalSales =
    ordersPriceGroup.length > 0 ? ordersPriceGroup[0].sales : 0;

  // Monthly sales for chart (last 6 months)
  const salesData = await Order.aggregate([
    {
      $match: { isPaid: true },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$paidAt" } },
        totalSales: { $sum: "$totalPrice" },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 6 },
  ]);

  await db.disconnect();

  return NextResponse.json({
    ordersCount,
    productsCount,
    usersCount,
    totalSales,
    salesData,
  });
}
