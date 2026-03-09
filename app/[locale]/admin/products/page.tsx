import ProductsTable from "./ProductsTable";
import { Product, SubCategory, Category, Brand } from "@/types";
import db, { MongoDocument } from "@/utils/db";
import ProductModel from "@/models/Product";
import SubCategoryModel from "@/models/SubCategory";
import CategoryModel from "@/models/Category";
import BrandModel from "@/models/Brand";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const searchQuery = params.q || "";
  const pageSize = 12;
  const skip = (page - 1) * pageSize;

  await db.connect();

  // Build search filter
  const searchFilter = searchQuery
    ? {
        $or: [
          { name: { $regex: searchQuery, $options: "i" } },
          { brand: { $regex: searchQuery, $options: "i" } },
          { category: { $regex: searchQuery, $options: "i" } },
          { subCategory: { $regex: searchQuery, $options: "i" } },
          { description: { $regex: searchQuery, $options: "i" } },
        ],
      }
    : {};

  const [productsDocs, totalProducts, subCategoriesDocs, categoriesDocs, brandsDocs] = await Promise.all([
    ProductModel.find(searchFilter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
    ProductModel.countDocuments(searchFilter),
    SubCategoryModel.find({}).lean(),
    CategoryModel.find({}).lean(),
    BrandModel.find({}).lean()
  ]);

  const products = productsDocs.map(doc => db.convertDocToObj(doc as MongoDocument) as unknown as Product);
  const subCategories = subCategoriesDocs.map(doc => db.convertDocToObj(doc as MongoDocument) as unknown as SubCategory);
  const categories = categoriesDocs.map(doc => db.convertDocToObj(doc as MongoDocument) as unknown as Category);
  const brands = brandsDocs.map(doc => db.convertDocToObj(doc as MongoDocument) as unknown as Brand);

  const totalPages = Math.ceil(totalProducts / pageSize);

  return (
    <ProductsTable
      initialProducts={products}
      totalPages={totalPages}
      subCategories={subCategories}
      categories={categories}
      brands={brands}
    />
  );
}
