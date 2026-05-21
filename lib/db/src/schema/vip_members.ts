import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";

export const vipMembersTable = pgTable("vip_members", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  fanName: text("fan_name"),
  tier: text("tier").notNull().default("monthly"),
  grantedBy: text("granted_by").notNull().default("admin"),
  txRef: text("tx_ref"),
  notes: text("notes"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  isActive: boolean("is_active").notNull().default(true),
  grantedAt: timestamp("granted_at", { withTimezone: true }).notNull().defaultNow(),
});

export type VipMember = typeof vipMembersTable.$inferSelect;
