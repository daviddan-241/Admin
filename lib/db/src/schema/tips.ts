import { pgTable, text, serial, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tipsTable = pgTable("tips", {
  id: serial("id").primaryKey(),
  fanEmail: text("fan_email").notNull(),
  fanName: text("fan_name").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  txRef: text("tx_ref").notNull().unique(),
  message: text("message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTipSchema = createInsertSchema(tipsTable).omit({ id: true, createdAt: true });
export type InsertTip = z.infer<typeof insertTipSchema>;
export type Tip = typeof tipsTable.$inferSelect;
