import GiftCardsList from "./GiftCardsList";
import { headers } from "next/headers";

async function getGiftCards() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:5000/api";
  const h = await headers();
  const cookie = h.get("cookie") || "";

  try {
    const res = await fetch(`${apiUrl}/admin/giftcards`, {
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
