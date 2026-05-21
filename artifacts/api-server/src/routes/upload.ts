import { Router, type IRouter } from "express";
import { adminAuth } from "../middleware/admin";
import path from "path";
import fs from "fs";

const router: IRouter = Router();

function saveBase64File(base64: string, subdir: string, filenameBase: string): string {
  const uploadsDir = path.join(process.cwd(), "uploads", subdir);
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const match = base64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9\-+.]+);base64,(.+)$/);
  const mimeType = match?.[1] || "application/octet-stream";
  const data = match ? match[2] : base64;

  // Derive extension from mime type
  const extMap: Record<string, string> = {
    "image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png", "image/gif": "gif",
    "image/webp": "webp", "image/heic": "heic",
    "video/mp4": "mp4", "video/quicktime": "mov", "video/webm": "webm",
    "video/x-msvideo": "avi", "video/3gpp": "3gp", "video/mpeg": "mpeg",
  };
  const ext = extMap[mimeType] || mimeType.split("/")[1] || "bin";
  const filename = `${filenameBase}.${ext}`;
  const filePath = path.join(uploadsDir, filename);

  fs.writeFileSync(filePath, Buffer.from(data, "base64"));
  return `/uploads/${subdir}/${filename}`;
}

// POST /upload — upload image OR video, returns { url, mediaType }
router.post("/upload", adminAuth, async (req, res): Promise<void> => {
  const { image, video, filename } = req.body as { image?: string; video?: string; filename?: string };

  if (!image && !video) {
    res.status(400).json({ error: "No image or video provided" });
    return;
  }

  try {
    const name = (filename || Date.now().toString()).replace(/[^a-zA-Z0-9_-]/g, "_");

    if (video) {
      const url = saveBase64File(video, "posts", `vid_${name}`);
      res.json({ url, mediaType: "video" });
      return;
    }

    const url = saveBase64File(image!, "posts", `img_${name}`);
    res.json({ url, mediaType: "image" });
  } catch (e: unknown) {
    res.status(500).json({ error: `Upload failed: ${e instanceof Error ? e.message : String(e)}` });
  }
});

export default router;
