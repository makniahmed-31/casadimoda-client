import ColorsList from "./ColorsList";
import { headers } from "next/headers";

async function getColors() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:5000/api";
  const h = await headers();
  const cookie = h.get("cookie") || "";

  try {
    const res = await fetch(`${apiUrl}/admin/colors`, {
      headers: { cookie },
      cache: "no-store",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Error fetching colors:", error);
    return [];
  }
}

export default async function AdminColorsPage() {
  const colors = await getColors();
  return <ColorsList initialColors={colors} />;
}
