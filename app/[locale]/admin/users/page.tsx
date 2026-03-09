import UsersList from "./UsersList";
import { headers } from "next/headers";
import { API_URL } from "@/utils/api";

async function getUsers() {
  const h = await headers();
  const cookie = h.get("cookie") || "";

  try {
    const res = await fetch(`${API_URL}/admin/users`, {
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
