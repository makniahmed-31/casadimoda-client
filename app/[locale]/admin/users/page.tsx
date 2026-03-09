import UsersList from "./UsersList";
import { headers } from "next/headers";

async function getUsers() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:5000/api";
  const h = await headers();
  const cookie = h.get("cookie") || "";

  try {
    const res = await fetch(`${apiUrl}/admin/users`, {
      headers: { cookie },
      cache: "no-store",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export default async function AdminUsersPage() {
  const users = await getUsers();
  return <UsersList initialUsers={users} />;
}
