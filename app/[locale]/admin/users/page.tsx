import UsersList from "./UsersList";
import { User } from "@/types";
import db, { MongoDocument } from "@/utils/db";
import UserModel from "@/models/User";

export default async function AdminUsersPage() {
    await db.connect();
    const docs = await UserModel.find({}).sort({ createdAt: -1 }).lean();

    const users = docs.map(doc => db.convertDocToObj(doc as MongoDocument) as unknown as User);

    return <UsersList initialUsers={users} />;
}
