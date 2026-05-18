import { pgTable, text, serial, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const requestsTable = pgTable("content_requests", {
  id: serial("id").primaryKey(),
  fanEmail: text("fan_email").notNull(),
  fanName: text("fan_name").notNull(),
  requestType: text("request_type").notNull(),
  description: text("description").notNull(),
  amountPaid: numeric("amount_paid", { precision: 10, scale: 2 }).notNull(),
  txRef: text("tx_ref").notNull().unique(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertRequestSchema = createInsertSchema(requestsTable).omit({ id: true, createdAt: true });
export type InsertRequest = z.infer<typeof insertRequestSchema>;
export type ContentRequest = typeof requestsTable.$inferSelect;
