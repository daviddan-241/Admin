import { pool } from "./index";

const SQL = `
CREATE TABLE IF NOT EXISTS "settings" (
  "id" serial PRIMARY KEY,
  "key" text NOT NULL UNIQUE,
  "value" text NOT NULL,
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "messages" (
  "id" serial PRIMARY KEY,
  "fan_email" text NOT NULL,
  "fan_name" text NOT NULL,
  "message" text NOT NULL,
  "amount_paid" numeric(10,2) NOT NULL,
  "tx_ref" text NOT NULL UNIQUE,
  "status" text NOT NULL DEFAULT 'paid',
  "reply" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "calls" (
  "id" serial PRIMARY KEY,
  "fan_email" text NOT NULL,
  "fan_name" text NOT NULL,
  "preferred_date" text NOT NULL,
  "duration_minutes" integer NOT NULL,
  "amount_paid" numeric(10,2) NOT NULL,
  "tx_ref" text NOT NULL UNIQUE,
  "status" text NOT NULL DEFAULT 'pending',
  "notes" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "content_requests" (
  "id" serial PRIMARY KEY,
  "fan_email" text NOT NULL,
  "fan_name" text NOT NULL,
  "request_type" text NOT NULL,
  "description" text NOT NULL,
  "amount_paid" numeric(10,2) NOT NULL,
  "tx_ref" text NOT NULL UNIQUE,
  "status" text NOT NULL DEFAULT 'pending',
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "tips" (
  "id" serial PRIMARY KEY,
  "fan_email" text NOT NULL,
  "fan_name" text NOT NULL,
  "amount" numeric(10,2) NOT NULL,
  "tx_ref" text NOT NULL UNIQUE,
  "message" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "posts" (
  "id" serial PRIMARY KEY,
  "image_url" text NOT NULL DEFAULT '',
  "video_url" text,
  "thumbnail_url" text,
  "media_type" text NOT NULL DEFAULT 'image',
  "caption" text,
  "content" text,
  "platform" text NOT NULL DEFAULT 'custom',
  "external_id" text,
  "is_private" boolean NOT NULL DEFAULT false,
  "watermark" boolean NOT NULL DEFAULT true,
  "published_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "chat_sessions" (
  "id" serial PRIMARY KEY,
  "fan_email" text NOT NULL,
  "fan_name" text NOT NULL,
  "fan_token" uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  "fan_avatar_url" text,
  "free_used" integer NOT NULL DEFAULT 0,
  "last_message_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "chat_messages" (
  "id" serial PRIMARY KEY,
  "session_id" integer NOT NULL REFERENCES "chat_sessions"("id"),
  "sender_type" text NOT NULL,
  "message" text NOT NULL,
  "amount_paid" numeric(10,2) NOT NULL DEFAULT 0,
  "tx_ref" text UNIQUE,
  "is_read" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "gift_cards" (
  "id" serial PRIMARY KEY,
  "fan_name" text NOT NULL,
  "fan_email" text NOT NULL,
  "card_type" text NOT NULL,
  "card_amount" text NOT NULL,
  "purpose" text NOT NULL DEFAULT 'subscription',
  "front_image_url" text NOT NULL,
  "back_image_url" text NOT NULL,
  "note" text,
  "status" text NOT NULL DEFAULT 'pending',
  "admin_note" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "verified_at" timestamptz
);

CREATE TABLE IF NOT EXISTS "vip_members" (
  "id" serial PRIMARY KEY,
  "email" text NOT NULL UNIQUE,
  "fan_name" text,
  "tier" text NOT NULL DEFAULT 'monthly',
  "granted_by" text NOT NULL DEFAULT 'admin',
  "tx_ref" text,
  "notes" text,
  "expires_at" timestamptz,
  "is_active" boolean NOT NULL DEFAULT true,
  "granted_at" timestamptz NOT NULL DEFAULT now()
);
`;

export async function ensureSchema(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(SQL);
  } finally {
    client.release();
  }
}
