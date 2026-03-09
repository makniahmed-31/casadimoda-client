import GiftCardsList from "./GiftCardsList";
import { GiftCard } from "@/types";
import db, { MongoDocument } from "@/utils/db";
import GiftCardModel from "@/models/GiftCard";

export default async function AdminGiftCardsPage() {
  await db.connect();
  const docs = await GiftCardModel.find({}).lean();

  const giftCards = docs.map(doc => db.convertDocToObj(doc as MongoDocument) as unknown as GiftCard);

  return <GiftCardsList initialGiftCards={giftCards} />;
}
