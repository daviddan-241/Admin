import { Router, type IRouter } from "express";
import { db, postsTable } from "@workspace/db";
import { adminAuth } from "../middleware/admin";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// Fetch and sync posts from X (Twitter) API
router.post("/social/sync/x", adminAuth, async (req, res): Promise<void> => {
  const bearerToken = process.env.X_BEARER_TOKEN;
  const handle = (req.body as { handle?: string }).handle || process.env.X_USERNAME;

  if (!bearerToken) {
    res.status(400).json({
      error: "X_BEARER_TOKEN environment variable not set. Add your X API Bearer Token in Replit Secrets.",
      setup: "1. Go to developer.twitter.com  2. Create an app  3. Copy your Bearer Token  4. Add it as X_BEARER_TOKEN in Replit Secrets"
    });
    return;
  }

  if (!handle) {
    res.status(400).json({ error: "No X handle provided. Pass handle in request body or set X_USERNAME env var." });
    return;
  }

  const cleanHandle = handle.replace(/^@/, "");

  try {
    // Get user ID
    const userRes = await fetch(`https://api.twitter.com/2/users/by/username/${cleanHandle}?user.fields=id,profile_image_url`, {
      headers: { Authorization: `Bearer ${bearerToken}` },
    });
    if (!userRes.ok) {
      const err = await userRes.text();
      res.status(400).json({ error: `X API error: ${err}` });
      return;
    }
    const userData = await userRes.json() as { data?: { id: string; name: string } };
    const userId = userData.data?.id;
    if (!userId) { res.status(400).json({ error: "User not found on X" }); return; }

    // Fetch tweets with media
    const tweetsRes = await fetch(
      `https://api.twitter.com/2/users/${userId}/tweets?tweet.fields=attachments,created_at,text&expansions=attachments.media_keys&media.fields=url,preview_image_url,type&max_results=20&exclude=retweets,replies`,
      { headers: { Authorization: `Bearer ${bearerToken}` } }
    );
    if (!tweetsRes.ok) {
      const err = await tweetsRes.text();
      res.status(400).json({ error: `X API tweets error: ${err}` });
      return;
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

    const synced: string[] = [];
    for (const tweet of tweetsData.data ?? []) {
      const mediaKeys = tweet.attachments?.media_keys ?? [];
      for (const key of mediaKeys) {
        const imageUrl = mediaMap.get(key);
        if (!imageUrl) continue;
        // check if already synced by txRef (using tweet id as ref)
        const existing = await db.select().from(postsTable).where(eq(postsTable.imageUrl, imageUrl)).limit(1);
        if (existing.length > 0) continue;
        await db.insert(postsTable).values({
          imageUrl,
          caption: tweet.text,
          platform: "twitter",
          isPrivate: false,
          watermark: false, // no watermark on platform-native content
        });
        synced.push(imageUrl);
      }
    }
    res.json({ synced: synced.length, urls: synced });
  } catch (e: unknown) {
    res.status(500).json({ error: `Sync failed: ${e instanceof Error ? e.message : String(e)}` });
  }
});

// Sync from TikTok (framework — TikTok API requires app approval)
router.post("/social/sync/tiktok", adminAuth, async (req, res): Promise<void> => {
  res.status(501).json({
    message: "TikTok API requires developer approval. For now, add TikTok content manually via the Feed manager in Admin.",
    workaround: "Download your TikTok video thumbnails and add them via the Feed manager with platform=tiktok.",
  });
});

export default router;
