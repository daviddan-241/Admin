import { Router, type IRouter } from "express";
import { adminAuth } from "../middleware/admin";

const router: IRouter = Router();

// In-memory config store — persists while server is running.
// On restart, values fall back to env vars.
export const platformConfig = {
  // Payment
  flutterwavePublicKey: process.env.FLW_PUBLIC_KEY || "",
  flutterwaveSecretKey: process.env.FLW_SECRET_KEY || "",
  currency: process.env.PAYMENT_CURRENCY || "USD",

  // Prices
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

  // Profile
  whatsappNumber: process.env.WHATSAPP_NUMBER || "13055550000",
  instagramUrl: process.env.INSTAGRAM_URL || "https://instagram.com/sophieraiin",
  twitterUrl: process.env.TWITTER_URL || "https://x.com/sophieraiin",
  tiktokUrl: process.env.TIKTOK_URL || "https://tiktok.com/@sophieraiin",
  onlyfansUrl: process.env.ONLYFANS_URL || "https://onlyfans.com/sophieraiin",
  creatorBio: process.env.CREATOR_BIO || "Miami-born creator, OnlyFans top earner, and your favourite girl on the internet. This is my exclusive digital home — no filters, no limits.",
  creatorTagline: process.env.CREATOR_TAGLINE || "Miami Creator · Entertainer · OnlyFans Top Earner",

  // Admin
  adminPassword: process.env.ADMIN_PASSWORD || "sophie2024!",

  // Social sync (mirrors socialRouter config)
  xBearerToken: process.env.X_BEARER_TOKEN || "",
  rapidApiKey: process.env.RAPIDAPI_KEY || "",
  xHandle: process.env.X_USERNAME || "",
  tiktokHandle: process.env.TIKTOK_USERNAME || "",

  // GitHub
  githubRemote: process.env.GITHUB_REMOTE || "",
};

// GET all settings (redact secrets partially)
router.get("/settings", adminAuth, (_req, res): void => {
  const safe = {
    ...platformConfig,
    flutterwavePublicKey: platformConfig.flutterwavePublicKey,
    flutterwaveSecretKey: platformConfig.flutterwaveSecretKey ? "***" + platformConfig.flutterwaveSecretKey.slice(-4) : "",
    xBearerToken: platformConfig.xBearerToken ? "***" + platformConfig.xBearerToken.slice(-6) : "",
    rapidApiKey: platformConfig.rapidApiKey ? "***" + platformConfig.rapidApiKey.slice(-6) : "",
    githubRemote: platformConfig.githubRemote ? platformConfig.githubRemote.replace(/\/\/.*@/, "//***@") : "",
    adminPassword: "***",
    // expose raw for editing
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

// PATCH individual settings
router.patch("/settings", adminAuth, (req, res): void => {
  const body = req.body as Partial<typeof platformConfig>;
  const allowed = Object.keys(platformConfig) as (keyof typeof platformConfig)[];
  for (const key of allowed) {
    if (key in body) {
      const val = body[key];
      if (typeof val === typeof platformConfig[key]) {
        (platformConfig as Record<string, unknown>)[key] = val;
      }
    }
  }
  // sync env vars for social/github routes that read process.env at startup
  if (body.xBearerToken !== undefined) process.env.X_BEARER_TOKEN = body.xBearerToken;
  if (body.rapidApiKey !== undefined) process.env.RAPIDAPI_KEY = body.rapidApiKey;
  if (body.githubRemote !== undefined) process.env.GITHUB_REMOTE = body.githubRemote;
  if (body.xHandle !== undefined) process.env.X_USERNAME = body.xHandle;
  if (body.tiktokHandle !== undefined) process.env.TIKTOK_USERNAME = body.tiktokHandle;

  res.json({ ok: true });
});

// Public endpoint — returns only what the frontend needs (prices, keys, links)
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
