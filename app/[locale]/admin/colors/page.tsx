import ColorsList from "./ColorsList";
import { headers } from "next/headers";
import { API_URL } from "@/utils/api";

async function getColors() {
  const h = await headers();
  const cookie = h.get("cookie") || "";

  try {
    const res = await fetch(`${API_URL}/admin/colors`, {
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
