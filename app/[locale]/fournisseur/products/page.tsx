import db, { MongoDocument } from "@/utils/db";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import Brand from "@/models/Brand";
import { Category as CategoryType, SubCategory as SubCategoryType, Brand as BrandType } from "@/types";
import SupplierProductsTable from "./ProductsTable";

export default async function SupplierProductsPage() {
  await db.connect();

  const categoriesDocs = await Category.find({}).lean();
  const subCategoriesDocs = await SubCategory.find({}).lean();
  const brandsDocs = await Brand.find({}).lean();

  const categories = categoriesDocs.map((doc) => db.convertDocToObj(doc as MongoDocument) as unknown as CategoryType);
  const subCategories = subCategoriesDocs.map((doc) => db.convertDocToObj(doc as MongoDocument) as unknown as SubCategoryType);
  const brands = brandsDocs.map((doc) => db.convertDocToObj(doc as MongoDocument) as unknown as BrandType);

  return (
    <SupplierProductsTable
      categories={categories}
      subCategories={subCategories}
      brands={brands}
    />
  );
}
