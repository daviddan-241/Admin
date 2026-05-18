import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, postsTable } from "@workspace/db";
import { adminAuth } from "../middleware/admin";

const router: IRouter = Router();

const PLATFORMS = ["instagram", "twitter", "tiktok", "custom"] as const;

function validatePost(body: Record<string, unknown>): { imageUrl: string; caption?: string; platform: string; isPrivate: boolean; watermark: boolean } | null {
  const { imageUrl, caption, platform, isPrivate, watermark } = body;
  if (typeof imageUrl !== "string" || !imageUrl.startsWith("http")) return null;
  const p = typeof platform === "string" && PLATFORMS.includes(platform as typeof PLATFORMS[number]) ? platform : "custom";
  return {
    imageUrl,
    caption: typeof caption === "string" ? caption : undefined,
    platform: p,
    isPrivate: isPrivate === true,
    watermark: watermark !== false,
  };
}

router.get("/posts", async (_req, res): Promise<void> => {
  const rows = await db.select().from(postsTable).orderBy(desc(postsTable.createdAt));
  res.json(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
});

router.post("/posts", adminAuth, async (req, res): Promise<void> => {
  const data = validatePost(req.body as Record<string, unknown>);
  if (!data) {
    res.status(400).json({ error: "Invalid post data. imageUrl must be a valid URL." });
    return;
  }
  const [row] = await db.insert(postsTable).values(data).returning();
  res.status(201).json({ ...row, createdAt: row.createdAt.toISOString() });
});

router.delete("/posts/:id", adminAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(postsTable).where(eq(postsTable.id, id));
  res.status(204).send();
});

export default router;
