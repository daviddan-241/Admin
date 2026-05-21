import { Router, type IRouter } from "express";
import { adminAuth } from "../middleware/admin";
import path from "path";
import fs from "fs";

const router: IRouter = Router();

// POST /upload — admin uploads an image (base64), returns URL
router.post("/upload", adminAuth, async (req, res): Promise<void> => {
  const { image, filename } = req.body as { image?: string; filename?: string };
  if (!image) { res.status(400).json({ error: "No image provided" }); return; }

  try {
    const uploadsDir = path.join(process.cwd(), "uploads", "posts");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const match = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    const ext = match?.[1]?.split("/")?.[1] || "jpg";
    const data = match ? match[2] : image;
    const name = (filename || Date.now().toString()).replace(/[^a-zA-Z0-9_-]/g, "_");
    const filePath = path.join(uploadsDir, `${name}.${ext}`);
    fs.writeFileSync(filePath, Buffer.from(data, "base64"));

    const url = `/uploads/posts/${name}.${ext}`;
    res.json({ url });
  } catch (e: unknown) {
    res.status(500).json({ error: `Upload failed: ${e instanceof Error ? e.message : String(e)}` });
  }
});

export default router;
