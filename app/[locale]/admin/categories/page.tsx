import CategoriesList from "./CategoriesList";
import { Category } from "@/types";
import db, { MongoDocument } from "@/utils/db";
import CategoryModel from "@/models/Category";

export default async function AdminCategoriesPage() {
  await db.connect();
  const docs = await CategoryModel.find({}).lean();

  const categories = docs.map(doc => db.convertDocToObj(doc as MongoDocument) as unknown as Category);

  return <CategoriesList initialCategories={categories} />;
}
