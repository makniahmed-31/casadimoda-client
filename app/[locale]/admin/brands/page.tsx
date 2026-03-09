import BrandsList from "./BrandsList";
import { Brand } from "@/types";
import db, { MongoDocument } from "@/utils/db";
import BrandModel from "@/models/Brand";

export default async function AdminBrandsPage() {
  await db.connect();
  const docs = await BrandModel.find({}).lean();

  const brands = docs.map(doc => db.convertDocToObj(doc as MongoDocument) as unknown as Brand);

  return <BrandsList initialBrands={brands} />;
}
