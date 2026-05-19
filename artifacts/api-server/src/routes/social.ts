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
    const existing = await db.select().from(postsTable).where(eq(postsTable.externalId, tweet.id)).limit(1);
    if (existing[0]) continue;
    const imageUrl = tweet.attachments?.media_keys?.[0] ? mediaMap.get(tweet.attachments.media_keys[0]) ?? null : null;
    await db.insert(postsTable).values({
      platform: "x",
      externalId: tweet.id,
      content: tweet.text,
      imageUrl,
      isVip: false,
      publishedAt: new Date(),
    });
    synced++;
  }
  return { synced, errors };
}

// ── Helper: fetch & save TikTok posts ─────────────────────────────────────
async function syncTikTok(handle: string, rapidApiKey: string): Promise<{ synced: number; errors: string[] }> {
  const errors: string[] = [];
  const cleanHandle = handle.replace(/^@/, "");

  const res = await fetch(
    `https://tiktok-scraper7.p.rapidapi.com/user/posts?unique_id=${encodeURIComponent(cleanHandle)}&count=20`,
    { headers: { "X-RapidAPI-Key": rapidApiKey, "X-RapidAPI-Host": "tiktok-scraper7.p.rapidapi.com" } }
  );
  if (!res.ok) {
    errors.push(`TikTok fetch failed: ${await res.text()}`);
    return { synced: 0, errors };
  }

  const data = await res.json() as {
    data?: { videos?: { video_id: string; title: string; cover: string; play: string }[] };
  };

  let synced = 0;
  for (const video of data.data?.videos ?? []) {
    const existing = await db.select().from(postsTable).where(eq(postsTable.externalId, video.video_id)).limit(1);
    if (existing[0]) continue;
    await db.insert(postsTable).values({
      platform: "tiktok",
      externalId: video.video_id,
      content: video.title,
      imageUrl: video.cover,
      videoUrl: video.play,
      isVip: false,
      publishedAt: new Date(),
    });
    synced++;
  }
  return { synced, errors };
}

// ── Run all syncs ─────────────────────────────────────────────────────────
async function runAllSyncs() {
  const xToken = process.env.X_BEARER_TOKEN || "";
  const rapidKey = process.env.RAPIDAPI_KEY || "";
  const results: Record<string, unknown> = {};
  if (xToken && syncConfig.xHandle) results.x = await syncX(syncConfig.xHandle, xToken);
  if (rapidKey && syncConfig.tiktokHandle) results.tiktok = await syncTikTok(syncConfig.tiktokHandle, rapidKey);
  return results;
}

// ── Restart scheduler ─────────────────────────────────────────────────────
function restartScheduler() {
  if (syncInterval) clearInterval(syncInterval);
  syncInterval = null;
  if (!syncConfig.enabled) return;
  const ms = syncConfig.intervalHours * 60 * 60 * 1000;
  syncInterval = setInterval(runAllSyncs, ms);
}

// ── GET sync config ───────────────────────────────────────────────────────
router.get("/social/sync/config", adminAuth, (_req, res) => {
  res.json(syncConfig);
});

// ── PATCH sync config ─────────────────────────────────────────────────────
router.patch("/social/sync/config", adminAuth, (req, res) => {
  const body = req.body as Partial<typeof syncConfig>;
  syncConfig = { ...syncConfig, ...body };
  restartScheduler();
  res.json(syncConfig);
});

// ── Manual X sync ─────────────────────────────────────────────────────────
router.post("/social/sync/x", adminAuth, async (req, res): Promise<void> => {
  const { handle } = req.body as { handle?: string };
  const bearerToken = process.env.X_BEARER_TOKEN || "";
  if (!handle) { res.status(400).json({ error: "handle required" }); return; }
  if (!bearerToken) { res.status(400).json({ error: "X_BEARER_TOKEN not set" }); return; }
  try {
    syncConfig.xHandle = handle;
    const result = await syncX(handle, bearerToken);
    res.json(result);
  } catch (e: unknown) {
    res.status(500).json({ error: `Sync failed: ${e instanceof Error ? e.message : String(e)}` });
  }
});

// ── Manual TikTok sync ────────────────────────────────────────────────────
router.post("/social/sync/tiktok", adminAuth, async (req, res): Promise<void> => {
  const { handle } = req.body as { handle?: string };
  const rapidKey = process.env.RAPIDAPI_KEY || "";
  if (!handle) { res.status(400).json({ error: "handle required" }); return; }
  if (!rapidKey) { res.status(400).json({ error: "RAPIDAPI_KEY not set" }); return; }
  try {
    syncConfig.tiktokHandle = handle;
    const result = await syncTikTok(handle, rapidKey);
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

    // Build remote: prefer GITHUB_REMOTE env, else auto-construct from GITHUB_PERSONAL_ACCESS_TOKEN
    const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN || "";
    const remote = process.env.GITHUB_REMOTE ||
      (token ? `https://${token}@github.com/daviddan-241/Hannah-brooks-love.git` : "");

    if (!remote) {
      res.status(400).json({
        error: "GitHub token not set.",
        setup: "GITHUB_PERSONAL_ACCESS_TOKEN is available in Replit secrets — ensure it has repo scope.",
      });
      return;
    }

    const { stdout, stderr } = await execAsync(`git push "${remote}" HEAD:main --force`);
    res.json({ success: true, stdout, stderr, timestamp });
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : String(e);
    res.status(500).json({ error: `Git push failed: ${err}`, stdout: (e as any).stdout, stderr: (e as any).stderr });
  }
});

export default router;
