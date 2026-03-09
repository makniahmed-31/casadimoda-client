import db from "@/utils/db";
import User from "@/models/User";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    await db.connect();
    const users = await User.find({}).sort({ createdAt: -1 });
    await db.disconnect();
    return NextResponse.json(users);
}
