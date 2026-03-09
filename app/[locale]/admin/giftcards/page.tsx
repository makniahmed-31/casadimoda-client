import GiftCardsList from "./GiftCardsList";
import { headers } from "next/headers";
import { API_URL } from "@/utils/api";

async function getGiftCards() {
  const h = await headers();
  const cookie = h.get("cookie") || "";

  try {
    const res = await fetch(`${API_URL}/admin/giftcards`, {
      headers: { cookie },
      cache: "no-store",
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Error fetching giftcards:", error);
    return [];
  }
}

export default async function AdminGiftCardsPage() {
  const giftCards = await getGiftCards();
  return <GiftCardsList initialGiftCards={giftCards} />;
}
