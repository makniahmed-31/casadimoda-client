import CouponsList from "./CouponsList";
import { Coupon } from "@/types";
import db, { MongoDocument } from "@/utils/db";
import CouponModel from "@/models/Coupon";

export default async function AdminCouponsPage() {
  await db.connect();
  const docs = await CouponModel.find({}).lean();

  const coupons = docs.map(doc => db.convertDocToObj(doc as MongoDocument) as unknown as Coupon);

  return <CouponsList initialCoupons={coupons} />;
}
