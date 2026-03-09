import SubCategoriesList from "./SubCategoriesList";
import { SubCategory, Category } from "@/types";
import db, { MongoDocument } from "@/utils/db";
import SubCategoryModel from "@/models/SubCategory";
import CategoryModel from "@/models/Category";

export default async function AdminSubcategoriesPage() {
    await db.connect();

    const [subCategoriesDocs, categoriesDocs] = await Promise.all([
        SubCategoryModel.find({}).lean(),
        CategoryModel.find({}).lean()
    ]);

    const subCategories = subCategoriesDocs.map(doc => db.convertDocToObj(doc as MongoDocument) as unknown as SubCategory);
    const categories = categoriesDocs.map(doc => db.convertDocToObj(doc as MongoDocument) as unknown as Category);

    return (
        <SubCategoriesList
            initialSubCategories={subCategories}
            categories={categories}
        />
    );
}
