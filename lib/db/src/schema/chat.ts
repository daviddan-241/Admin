import { pgTable, text, serial, timestamp, integer, numeric, boolean, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const chatSessionsTable = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  fanEmail: text("fan_email").notNull(),
  fanName: text("fan_name").notNull(),
  fanToken: uuid("fan_token").notNull().unique().default(sql`gen_random_uuid()`),
  freeUsed: integer("free_used").notNull().default(0),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chatMessagesTable = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => chatSessionsTable.id),
  senderType: text("sender_type").notNull(), // 'fan' | 'hannah'
  message: text("message").notNull(),
  amountPaid: numeric("amount_paid", { precision: 10, scale: 2 }).notNull().default("0"),
  txRef: text("tx_ref").unique(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ChatSession = typeof chatSessionsTable.$inferSelect;
export type ChatMessage = typeof chatMessagesTable.$inferSelect;
