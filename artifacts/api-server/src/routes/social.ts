import { Router, type IRouter } from "express";
import { db, postsTable } from "@workspace/db";
import { adminAuth } from "../middleware/admin";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// ── Auto-sync scheduler state ──────────────────────────────────────────────
let syncInterval: ReturnType<typeof setInterval> | null = null;
let syncConfig = {
  enabled: false,
  intervalHours: 6,
  xHandle: process.env.X_USERNAME || "",
  tiktokHandle: process.env.TIKTOK_USERNAME || "",
};

// ── Helper: fetch & save X posts ─────────────────────────────────────────
async function syncX(handle: string, bearerToken: string): Promise<{ synced: number; errors: string[] }> {
  const errors: string[] = [];
  const cleanHandle = handle.replace(/^@/, "").replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//i, "").split("?")[0];

  const userRes = await fetch(
    `https://api.twitter.com/2/users/by/username/${cleanHandle}?user.fields=id,profile_image_url`,
    { headers: { Authorization: `Bearer ${bearerToken}` } }
  );
  if (!userRes.ok) {
    errors.push(`X user lookup failed: ${await userRes.text()}`);
    return { synced: 0, errors };
  }
  const userData = await userRes.json() as { data?: { id: string } };
  const userId = userData.data?.id;
  if (!userId) { errors.push("X user not found"); return { synced: 0, errors }; }

  const tweetsRes = await fetch(
    `https://api.twitter.com/2/users/${userId}/tweets?tweet.fields=attachments,created_at,text&expansions=attachments.media_keys&media.fields=url,preview_image_url,type&max_results=20&exclude=retweets,replies`,
    { headers: { Authorization: `Bearer ${bearerToken}` } }
  );
  if (!tweetsRes.ok) {
    errors.push(`X tweets fetch failed: ${await tweetsRes.text()}`);
    return { synced: 0, errors };
  }

  const tweetsData = await tweetsRes.json() as {
    data?: { id: string; text: string; attachments?: { media_keys?: string[] } }[];
    includes?: { media?: { media_key: string; url?: string; preview_image_url?: string; type: string }[] };
  };

  const mediaMap = new Map<string, string>();
  (tweetsData.includes?.media ?? []).forEach((m) => {
    const url = m.url ?? m.preview_image_url;
    if (url) mediaMap.set(m.media_key, url);
  });

  let synced = 0;
  for (const tweet of tweetsData.data ?? []) {
    const mediaKeys = tweet.attachments?.media_keys ?? [];
    for (const key of mediaKeys) {
      const imageUrl = mediaMap.get(key);
      if (!imageUrl) continue;
      const existing = await db.select().from(postsTable).where(eq(postsTable.imageUrl, imageUrl)).limit(1);
      if (existing.length > 0) continue;
      await db.insert(postsTable).values({
        imageUrl,
        caption: tweet.text,
        platform: "twitter",
        isPrivate: false,
        watermark: false,
      });
      synced++;
    }
  }
  return { synced, errors };
}

// ── Helper: fetch & save TikTok posts (via RapidAPI scraper — no watermark) ─
async function syncTikTok(handle: string, rapidApiKey: string): Promise<{ synced: number; errors: string[] }> {
  const errors: string[] = [];
  const cleanHandle = handle.replace(/^@/, "").replace(/^https?:\/\/(www\.)?tiktok\.com\/@?/i, "").split("?")[0];

  try {
    // Try RapidAPI TikTok scraper
    const res = await fetch(
      `https://tiktok-scraper7.p.rapidapi.com/user/posts?unique_id=${encodeURIComponent(cleanHandle)}&count=20&cursor=0`,
      {
        headers: {
          "x-rapidapi-key": rapidApiKey,
          "x-rapidapi-host": "tiktok-scraper7.p.rapidapi.com",
        },
      }
    );
    if (!res.ok) {
      errors.push(`TikTok API error: ${res.status} ${await res.text()}`);
      return { synced: 0, errors };
    }
    const data = await res.json() as {
      data?: {
        videos?: {
          video_id: string;
          title: string;
          cover: string;
          play: string;
          wmplay?: string;
          nowatermark?: string;
        }[];
      };
      code?: number;
    };

    const videos = data?.data?.videos ?? [];
    if (videos.length === 0) {
      errors.push("No TikTok videos found. Check the handle.");
      return { synced: 0, errors };
    }

    let synced = 0;
    for (const vid of videos) {
      // Prefer no-watermark cover image
      const imageUrl = vid.cover;
      if (!imageUrl) continue;
      const existing = await db.select().from(postsTable).where(eq(postsTable.imageUrl, imageUrl)).limit(1);
      if (existing.length > 0) continue;
      await db.insert(postsTable).values({
        imageUrl,
        caption: vid.title || null,
        platform: "tiktok",
        isPrivate: false,
        watermark: false,
      });
      synced++;
    }
    return { synced, errors };
  } catch (e) {
    errors.push(`TikTok sync error: ${e instanceof Error ? e.message : String(e)}`);
    return { synced: 0, errors };
  }
}

// ── Run all enabled syncs ─────────────────────────────────────────────────
async function runAllSyncs(): Promise<{ x: { synced: number; errors: string[] }; tiktok: { synced: number; errors: string[] } }> {
  const bearerToken = process.env.X_BEARER_TOKEN || "";
  const rapidApiKey = process.env.RAPIDAPI_KEY || "";

  const xResult = syncConfig.xHandle && bearerToken
    ? await syncX(syncConfig.xHandle, bearerToken)
    : { synced: 0, errors: ["X_BEARER_TOKEN or handle not set"] };

  const tiktokResult = syncConfig.tiktokHandle && rapidApiKey
    ? await syncTikTok(syncConfig.tiktokHandle, rapidApiKey)
    : { synced: 0, errors: ["RAPIDAPI_KEY or TikTok handle not set"] };

  return { x: xResult, tiktok: tiktokResult };
}

function startScheduler() {
  if (syncInterval) clearInterval(syncInterval);
  if (!syncConfig.enabled) return;
  const ms = syncConfig.intervalHours * 60 * 60 * 1000;
  syncInterval = setInterval(async () => {
    console.log("[social-sync] Auto-sync running...");
    const result = await runAllSyncs();
    console.log("[social-sync] Done:", JSON.stringify(result));
  }, ms);
  console.log(`[social-sync] Scheduler started every ${syncConfig.intervalHours}h`);
}

// ── GET sync config ────────────────────────────────────────────────────────
router.get("/social/config", adminAuth, (_req, res) => {
  res.json({
    ...syncConfig,
    hasXToken: !!process.env.X_BEARER_TOKEN,
    hasRapidApiKey: !!process.env.RAPIDAPI_KEY,
  });
});

// ── UPDATE sync config ─────────────────────────────────────────────────────
router.post("/social/config", adminAuth, (req, res) => {
  const body = req.body as Partial<typeof syncConfig>;
  if (typeof body.enabled === "boolean") syncConfig.enabled = body.enabled;
  if (typeof body.intervalHours === "number" && body.intervalHours >= 1) syncConfig.intervalHours = body.intervalHours;
  if (typeof body.xHandle === "string") syncConfig.xHandle = body.xHandle;
  if (typeof body.tiktokHandle === "string") syncConfig.tiktokHandle = body.tiktokHandle;
  startScheduler();
  res.json({ ok: true, config: syncConfig });
});

// ── Manual sync X ─────────────────────────────────────────────────────────
router.post("/social/sync/x", adminAuth, async (req, res): Promise<void> => {
  const body = req.body as { handle?: string };
  const handle = body.handle || syncConfig.xHandle || process.env.X_USERNAME || "";
  const bearerToken = process.env.X_BEARER_TOKEN || "";

  if (!bearerToken) {
    res.status(400).json({
      error: "X_BEARER_TOKEN not set.",
      setup: "Add X_BEARER_TOKEN in Replit Secrets (developer.twitter.com → create app → Bearer Token).",
    });
    return;
  }
  if (!handle) {
    res.status(400).json({ error: "No X handle provided. Enter it in the Social Sync settings." });
    return;
  }

  if (handle) syncConfig.xHandle = handle;

  try {
    const result = await syncX(handle, bearerToken);
    res.json(result);
  } catch (e: unknown) {
    res.status(500).json({ error: `Sync failed: ${e instanceof Error ? e.message : String(e)}` });
  }
});

// ── Manual sync TikTok ────────────────────────────────────────────────────
router.post("/social/sync/tiktok", adminAuth, async (req, res): Promise<void> => {
  const body = req.body as { handle?: string };
  const handle = body.handle || syncConfig.tiktokHandle || process.env.TIKTOK_USERNAME || "";
  const rapidApiKey = process.env.RAPIDAPI_KEY || "";

  if (!rapidApiKey) {
    res.status(400).json({
      error: "RAPIDAPI_KEY not set.",
      setup: "Add RAPIDAPI_KEY in Replit Secrets. Subscribe to 'TikTok Scraper' on rapidapi.com (free tier available).",
    });
    return;
  }
  if (!handle) {
    res.status(400).json({ error: "No TikTok handle provided. Enter it in the Social Sync settings." });
    return;
  }

  if (handle) syncConfig.tiktokHandle = handle;

  try {
    const result = await syncTikTok(handle, rapidApiKey);
    res.json(result);
  } catch (e: unknown) {
    res.status(500).json({ error: `Sync failed: ${e instanceof Error ? e.message : String(e)}` });
  }
});

// ── Manual sync both ──────────────────────────────────────────────────────
router.post("/social/sync/all", adminAuth, async (_req, res): Promise<void> => {
  try {
    const result = await runAllSyncs();
    res.json(result);
  } catch (e: unknown) {
    res.status(500).json({ error: `Sync failed: ${e instanceof Error ? e.message : String(e)}` });
  }
});

// ── GitHub push ───────────────────────────────────────────────────────────
router.post("/social/github/push", adminAuth, async (_req, res): Promise<void> => {
  const { exec } = await import("child_process");
  const { promisify } = await import("util");
  const execAsync = promisify(exec);

  try {
    await execAsync('git config user.email "admin@hannahbrooks.com"');
    await execAsync('git config user.name "Hannah Brooks Admin"');
    await execAsync("git add -A");
    const timestamp = new Date().toISOString();
    await execAsync(`git commit -m "Auto-sync update ${timestamp}" --allow-empty`);

    const remote = process.env.GITHUB_REMOTE || "";
    if (!remote) {
      res.status(400).json({
        error: "GITHUB_REMOTE not set.",
        setup: "Add GITHUB_REMOTE in Replit Secrets with your GitHub repo URL (e.g. https://TOKEN@github.com/user/repo.git).",
      });
      return;
    }

    const { stdout, stderr } = await execAsync(`git push ${remote} HEAD:main --force`);
    res.json({ ok: true, stdout, stderr });
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string; message?: string };
    res.status(500).json({ error: err.message, stdout: err.stdout, stderr: err.stderr });
  }
});

export default router;
