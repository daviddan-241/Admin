import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";

export const giftCardsTable = pgTable("gift_cards", {
  id: serial("id").primaryKey(),
  fanName: text("fan_name").notNull(),
  fanEmail: text("fan_email").notNull(),
  cardType: text("card_type").notNull(),
  cardAmount: text("card_amount").notNull(),
  purpose: text("purpose").notNull().default("subscription"),
  frontImageUrl: text("front_image_url").notNull(),
  backImageUrl: text("back_image_url").notNull(),
  note: text("note"),
  status: text("status").notNull().default("pending"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
});

export type GiftCard = typeof giftCardsTable.$inferSelect;
