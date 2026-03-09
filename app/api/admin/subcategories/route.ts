import { NextResponse } from "next/server";
import db from "@/utils/db";
import SubCategory from "@/models/SubCategory";
import slugify from "slugify";

export async function GET() {
    await db.connect();
    const subCategories = await SubCategory.find({});
    await db.disconnect();
    return NextResponse.json(subCategories);
}

export async function POST(req: Request) {
    try {
        await db.connect();
        const body = await req.json();
        const { name, parentCategory, description } = body;

        const subCategory = await SubCategory.create({
            name,
            slug: slugify(name, { lower: true }),
            parentCategory,
            description,
        });

        await db.disconnect();
        return NextResponse.json(subCategory, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error creating subcategory", error },
            { status: 500 }
        );
    }
}

export async function PUT(req: Request) {
    try {
        await db.connect();
        const body = await req.json();
        const { id, name, slug, parentCategory, description } = body;
        if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });

        const updated = await SubCategory.findByIdAndUpdate(
            id,
            { name, slug: slug || slugify(name, { lower: true }), parentCategory, description },
            { new: true }
        );

        await db.disconnect();
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json(
            { message: "Error updating subcategory", error },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });

        await db.connect();
        await SubCategory.findByIdAndDelete(id);
        await db.disconnect();
        return NextResponse.json({ message: "SubCategory deleted" });
    } catch (error) {
        return NextResponse.json(
            { message: "Error deleting subcategory", error },
            { status: 500 }
        );
    }
}
