import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";

export const postsTable = pgTable("posts", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  videoUrl: text("video_url"),
  thumbnailUrl: text("thumbnail_url"),
  mediaType: text("media_type").notNull().default("image"),
  caption: text("caption"),
  platform: text("platform").notNull().default("custom"),
  isPrivate: boolean("is_private").notNull().default(false),
  watermark: boolean("watermark").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Post = typeof postsTable.$inferSelect;
