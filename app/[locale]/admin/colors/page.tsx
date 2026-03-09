import ColorsList from "./ColorsList";
import db, { MongoDocument } from "@/utils/db";
import ColorModel from "@/models/Color";

export default async function AdminColorsPage() {
  await db.connect();
  const docs = await ColorModel.find({}).sort({ name: 1 }).lean();
  const colors = docs.map((doc) => db.convertDocToObj(doc as MongoDocument));
  return <ColorsList initialColors={colors as { _id: string; name: string; hex: string }[]} />;
}
