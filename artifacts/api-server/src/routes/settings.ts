import { Router, type IRouter } from "express";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { adminAuth } from "../middleware/admin";

const router: IRouter = Router();

export const platformConfig = {
  flutterwavePublicKey: process.env.FLW_PUBLIC_KEY || "",
  flutterwaveSecretKey: process.env.FLW_SECRET_KEY || "",
  currency: process.env.PAYMENT_CURRENCY || "USD",
  msgPrice: parseFloat(process.env.MSG_PRICE || "9.99"),
  msgFreeLimit: parseInt(process.env.MSG_FREE_LIMIT || "3", 10),
  subMonthly: parseFloat(process.env.SUB_MONTHLY || "24.99"),
  subQuarterly: parseFloat(process.env.SUB_QUARTERLY || "59.99"),
  subLifetime: parseFloat(process.env.SUB_LIFETIME || "149.99"),
  requestPrice: parseFloat(process.env.REQUEST_PRICE || "49.99"),
  tipMin: parseFloat(process.env.TIP_MIN || "5.00"),
  callWa5: parseFloat(process.env.CALL_WA5 || "29.99"),
  callZoom15: parseFloat(process.env.CALL_ZOOM15 || "79.99"),
  callZoom30: parseFloat(process.env.CALL_ZOOM30 || "149.99"),
  callPrivate60: parseFloat(process.env.CALL_PRIVATE60 || "299.99"),
  whatsappNumber: process.env.WHATSAPP_NUMBER || "13055550000",
  instagramUrl: process.env.INSTAGRAM_URL || "https://instagram.com/sophieraiin",
  twitterUrl: process.env.TWITTER_URL || "https://x.com/sophieraiin",
  tiktokUrl: process.env.TIKTOK_URL || "https://tiktok.com/@sophieraiin",
  onlyfansUrl: process.env.ONLYFANS_URL || "https://onlyfans.com/sophieraiin",
  creatorBio: process.env.CREATOR_BIO || "Miami-born creator, OnlyFans top earner, and your favourite girl on the internet. This is my exclusive digital home — no filters, no limits.",
  creatorTagline: process.env.CREATOR_TAGLINE || "Miami Creator · Entertainer · OnlyFans Top Earner",
  adminPassword: process.env.ADMIN_PASSWORD || "sophie2024!",
  xBearerToken: process.env.X_BEARER_TOKEN || "",
  rapidApiKey: process.env.RAPIDAPI_KEY || "",
  xHandle: process.env.X_USERNAME || "",
  tiktokHandle: process.env.TIKTOK_USERNAME || "",
  githubRemote: process.env.GITHUB_REMOTE || "",
};

const NUMERIC_KEYS = new Set([
  "msgPrice","msgFreeLimit","subMonthly","subQuarterly","subLifetime",
  "requestPrice","tipMin","callWa5","callZoom15","callZoom30","callPrivate60",
]);

export async function loadSettingsFromDb(): Promise<void> {
  try {
    const rows = await db.select().from(settingsTable);
    for (const row of rows) {
      const key = row.key as keyof typeof platformConfig;
      if (!(key in platformConfig)) continue;
      const raw = row.value;
      if (NUMERIC_KEYS.has(key)) {
        (platformConfig as Record<string, unknown>)[key] = parseFloat(raw);
      } else {
        (platformConfig as Record<string, unknown>)[key] = raw;
      }
    }
    syncEnvFromConfig();
  } catch {
    // DB might not have settings table yet; will be created on first save
  }
}

async function saveSettingToDb(key: string, value: string): Promise<void> {
  await db
    .insert(settingsTable)
    .values({ key, value })
    .onConflictDoUpdate({ target: settingsTable.key, set: { value, updatedAt: new Date() } });
}

function syncEnvFromConfig(): void {
  if (platformConfig.xBearerToken) process.env.X_BEARER_TOKEN = platformConfig.xBearerToken;
  if (platformConfig.rapidApiKey) process.env.RAPIDAPI_KEY = platformConfig.rapidApiKey;
  if (platformConfig.githubRemote) process.env.GITHUB_REMOTE = platformConfig.githubRemote;
  if (platformConfig.xHandle) process.env.X_USERNAME = platformConfig.xHandle;
  if (platformConfig.tiktokHandle) process.env.TIKTOK_USERNAME = platformConfig.tiktokHandle;
  if (platformConfig.adminPassword) process.env.ADMIN_PASSWORD = platformConfig.adminPassword;
}

router.get("/settings", adminAuth, (_req, res): void => {
  const safe = {
    ...platformConfig,
    flutterwaveSecretKey: platformConfig.flutterwaveSecretKey ? "***" + platformConfig.flutterwaveSecretKey.slice(-4) : "",
    xBearerToken: platformConfig.xBearerToken ? "***" + platformConfig.xBearerToken.slice(-6) : "",
    rapidApiKey: platformConfig.rapidApiKey ? "***" + platformConfig.rapidApiKey.slice(-6) : "",
    githubRemote: platformConfig.githubRemote ? platformConfig.githubRemote.replace(/\/\/.*@/, "//***@") : "",
    adminPassword: "***",
    _raw: {
      flutterwaveSecretKey: platformConfig.flutterwaveSecretKey,
      xBearerToken: platformConfig.xBearerToken,
      rapidApiKey: platformConfig.rapidApiKey,
      githubRemote: platformConfig.githubRemote,
      adminPassword: platformConfig.adminPassword,
    },
  };
  res.json(safe);
});

router.patch("/settings", adminAuth, async (req, res): Promise<void> => {
  const body = req.body as Partial<typeof platformConfig>;
  const allowed = Object.keys(platformConfig) as (keyof typeof platformConfig)[];
  const toSave: Array<{ key: string; value: string }> = [];

  for (const key of allowed) {
    if (key in body) {
      const val = body[key];
      if (typeof val === typeof platformConfig[key]) {
        (platformConfig as Record<string, unknown>)[key] = val;
        toSave.push({ key, value: String(val) });
      }
    }
  }

  syncEnvFromConfig();

  await Promise.all(toSave.map(({ key, value }) => saveSettingToDb(key, value)));

  res.json({ ok: true });
});

router.get("/config/public", (_req, res): void => {
  res.json({
    flutterwavePublicKey: platformConfig.flutterwavePublicKey,
    currency: platformConfig.currency,
    msgPrice: platformConfig.msgPrice,
    msgFreeLimit: platformConfig.msgFreeLimit,
    subMonthly: platformConfig.subMonthly,
    subQuarterly: platformConfig.subQuarterly,
    subLifetime: platformConfig.subLifetime,
    requestPrice: platformConfig.requestPrice,
    tipMin: platformConfig.tipMin,
    callWa5: platformConfig.callWa5,
    callZoom15: platformConfig.callZoom15,
    callZoom30: platformConfig.callZoom30,
    callPrivate60: platformConfig.callPrivate60,
    whatsappNumber: platformConfig.whatsappNumber,
    instagramUrl: platformConfig.instagramUrl,
    twitterUrl: platformConfig.twitterUrl,
    tiktokUrl: platformConfig.tiktokUrl,
    onlyfansUrl: platformConfig.onlyfansUrl,
    creatorBio: platformConfig.creatorBio,
    creatorTagline: platformConfig.creatorTagline,
  });
});

export default router;
