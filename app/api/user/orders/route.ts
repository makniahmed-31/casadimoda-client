import db from "@/utils/db";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";
import Coupon from "@/models/Coupon";
import GiftCard from "@/models/GiftCard";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderItems, shippingAddress, paymentMethod, couponCode, giftCardCode } = body;

    if (!orderItems?.length || !shippingAddress || !paymentMethod) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await db.connect();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      await db.disconnect();
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Verify each item against the DB: price, stock, existence
    const verifiedItems = [];
    for (const item of orderItems) {
      const dbProduct = await Product.findOne({ name: item.name }).select(
        "name slug image price discountPrice countInStock"
      );

      if (!dbProduct) {
        await db.disconnect();
        return NextResponse.json(
          { message: `Product not found: ${item.name}` },
          { status: 400 }
        );
      }

      if (dbProduct.countInStock < item.quantity) {
        await db.disconnect();
        return NextResponse.json(
          { message: `Insufficient stock for: ${dbProduct.name} (available: ${dbProduct.countInStock})` },
          { status: 400 }
        );
      }

      const unitPrice =
        dbProduct.discountPrice > 0 && dbProduct.discountPrice < dbProduct.price
          ? dbProduct.discountPrice
          : dbProduct.price;

      verifiedItems.push({
        name: dbProduct.name,
        slug: dbProduct.slug,
        image: item.image || dbProduct.image,
        price: unitPrice,
        quantity: item.quantity,
        color: item.color || undefined,
        size: item.size || undefined,
      });
    }

    const itemsPrice = verifiedItems.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );

    // Validate coupon server-side if provided
    let couponDiscount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      appliedCoupon = await Coupon.findOne({
        code: couponCode.trim().toUpperCase(),
        isActive: true,
      });
      if (appliedCoupon) {
        const expired = appliedCoupon.expiryDate && new Date(appliedCoupon.expiryDate) < new Date();
        const limitReached = appliedCoupon.maxUsage !== null && appliedCoupon.usageCount >= appliedCoupon.maxUsage;
        if (!expired && !limitReached) {
          couponDiscount =
            appliedCoupon.type === "percentage"
              ? Math.round((itemsPrice * appliedCoupon.discount) / 100)
              : appliedCoupon.discount;
          couponDiscount = Math.min(couponDiscount, itemsPrice);
        } else {
          appliedCoupon = null;
        }
      }
    }

    // Validate gift card server-side if provided
    let giftCardDiscount = 0;
    let appliedGiftCard = null;
    if (giftCardCode) {
      appliedGiftCard = await GiftCard.findOne({
        code: giftCardCode.trim().toUpperCase(),
        isActive: true,
      });
      if (appliedGiftCard) {
        const expired = appliedGiftCard.expiryDate && new Date(appliedGiftCard.expiryDate) < new Date();
        if (!expired && appliedGiftCard.balance > 0) {
          const afterCoupon = itemsPrice - couponDiscount;
          giftCardDiscount = Math.min(appliedGiftCard.balance, afterCoupon);
        } else {
          appliedGiftCard = null;
        }
      }
    }

    const totalPrice = itemsPrice - couponDiscount - giftCardDiscount;

    const order = new Order({
      user: user._id,
      orderItems: verifiedItems,
      shippingAddress,
      paymentMethod,
      couponCode: appliedCoupon?.code,
      couponDiscount,
      giftCardCode: appliedGiftCard?.code,
      giftCardDiscount,
      itemsPrice,
      shippingPrice: 0,
      taxPrice: 0,
      totalPrice,
      isPaid: false,
      isDelivered: false,
    });

    const createdOrder = await order.save();

    // Update coupon usage after order is confirmed
    if (appliedCoupon) {
      appliedCoupon.usageCount += 1;
      if (appliedCoupon.maxUsage !== null && appliedCoupon.usageCount >= appliedCoupon.maxUsage) {
        appliedCoupon.isActive = false;
      }
      await appliedCoupon.save();
    }

    // Deduct from gift card balance
    if (appliedGiftCard) {
      appliedGiftCard.balance -= giftCardDiscount;
      if (appliedGiftCard.balance <= 0) {
        appliedGiftCard.isActive = false;
        appliedGiftCard.balance = 0;
      }
      await appliedGiftCard.save();
    }

    await db.disconnect();
    return NextResponse.json({ _id: createdOrder._id.toString() }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ message: "Error creating order" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { orderId, cancellationReason, confirmReception } = await req.json();
    if (!orderId) {
      return NextResponse.json({ message: "orderId required" }, { status: 400 });
    }

    await db.connect();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const order = await Order.findOne({ _id: orderId, user: user._id });
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (confirmReception) {
      if (!order.isDelivered) {
        return NextResponse.json({ message: "Order not yet delivered" }, { status: 400 });
      }
      order.isConfirmedByClient = true;
      order.confirmedAt = new Date();
      await order.save();
      return NextResponse.json({ message: "Reception confirmed" });
    }

    if (order.isPaid || order.isDelivered || order.isCancelled) {
      return NextResponse.json({ message: "Cannot cancel this order" }, { status: 400 });
    }

    order.isCancelled = true;
    order.cancelledAt = new Date();
    order.cancellationReason = cancellationReason || "";
    order.cancelledBy = "client";
    await order.save();

    return NextResponse.json({ message: "Order cancelled" });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return NextResponse.json({ message: "Error cancelling order" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await db.connect();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const orders = await Order.find({ user: user._id })
      .sort({ createdAt: -1 })
      .lean();

    const serialized = orders.map((order) => ({
      ...order,
      _id: order._id.toString(),
      user: order.user.toString(),
      createdAt: order.createdAt?.toString(),
      updatedAt: order.updatedAt?.toString(),
      paidAt: order.paidAt?.toString(),
      deliveredAt: order.deliveredAt?.toString(),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { message: "Error fetching orders" },
      { status: 500 }
    );
  }
}
