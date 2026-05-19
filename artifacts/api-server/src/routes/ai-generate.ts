import { Router, type IRouter } from "express";
import { db, postsTable } from "@workspace/db";
import { adminAuth } from "../middleware/admin";
import multer from "multer";
import path from "path";
import fs from "fs";

const router: IRouter = Router();

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `ai_${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 200 * 1024 * 1024 } });

// In-memory task store (use Redis in production for scale)
const tasks = new Map<string, {
  id: string;
  status: "queued" | "processing" | "completed" | "error" | "needs_gpu";
  progress?: number;
  result?: unknown;
  createdAt: string;
}>();

function newTaskId() {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ── POST /ai/generate-image — DALL-E 3 ───────────────────────────────────────
router.post("/ai/generate-image", adminAuth, async (req, res): Promise<void> => {
  const {
    prompt, size = "1024x1024", quality = "hd", style = "vivid",
    publishToFeed = false, isVip = false, caption,
  } = req.body as {
    prompt: string; size?: string; quality?: string; style?: string;
    publishToFeed?: boolean; isVip?: boolean; caption?: string;
  };

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(400).json({ error: "OPENAI_API_KEY not configured. Add it in Admin → Settings → AI Keys." });
    return;
  }
  if (!prompt?.trim()) { res.status(400).json({ error: "prompt required" }); return; }

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt.trim(),
        n: 1,
        size: ["1024x1024", "1792x1024", "1024x1792"].includes(size) ? size : "1024x1024",
        quality: quality === "standard" ? "standard" : "hd",
        style: style === "natural" ? "natural" : "vivid",
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      res.status(500).json({ error: `OpenAI error: ${errText}` });
      return;
    }

    const data = await response.json() as { data: [{ url: string; revised_prompt: string }] };
    const imageUrl = data.data[0].url;
    const revisedPrompt = data.data[0].revised_prompt;

    let post = null;
    if (publishToFeed) {
      const [inserted] = await db.insert(postsTable).values({
        platform: "custom",
        content: caption || prompt.trim(),
        imageUrl,
        isVip: Boolean(isVip),
        publishedAt: new Date(),
      }).returning();
      post = inserted;
    }

    res.json({ imageUrl, revisedPrompt, post });
  } catch (e: unknown) {
    res.status(500).json({ error: `Generation failed: ${e instanceof Error ? e.message : String(e)}` });
  }
});

// ── POST /ai/generate-video — Text-to-video (RunwayML or GPU worker) ─────────
router.post("/ai/generate-video", adminAuth, async (req, res): Promise<void> => {
  const { prompt, imageUrl: sourceImageUrl, duration = 5 } = req.body as {
    prompt: string; imageUrl?: string; duration?: number;
  };
  if (!prompt?.trim()) { res.status(400).json({ error: "prompt required" }); return; }

  const runwayKey = process.env.RUNWAYML_API_KEY;
  const gpuWorkerUrl = process.env.GPU_WORKER_URL;

  // RunwayML Gen-3 Turbo
  if (runwayKey) {
    try {
      const body: Record<string, unknown> = {
        promptText: prompt.trim(),
        model: "gen3a_turbo",
        duration: Math.min(10, Math.max(5, duration)),
      };
      if (sourceImageUrl) body.promptImage = sourceImageUrl;

      const response = await fetch("https://api.dev.runwayml.com/v1/image_to_video", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${runwayKey}`,
          "Content-Type": "application/json",
          "X-Runway-Version": "2024-11-06",
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        res.status(500).json({ error: `RunwayML: ${await response.text()}` });
        return;
      }
      const data = await response.json() as { id: string };
      res.json({ taskId: data.id, status: "generating", provider: "runwayml" });
      return;
    } catch (e) {
      res.status(500).json({ error: `RunwayML failed: ${String(e)}` });
      return;
    }
  }

  // GPU Worker
  if (gpuWorkerUrl) {
    const taskId = newTaskId();
    tasks.set(taskId, { id: taskId, status: "queued", progress: 0, createdAt: new Date().toISOString() });
    void (async () => {
      try {
        tasks.set(taskId, { id: taskId, status: "processing", progress: 10, createdAt: new Date().toISOString() });
        const r = await fetch(`${gpuWorkerUrl}/generate-video`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, sourceImageUrl, duration }),
        });
        const result = await r.json();
        tasks.set(taskId, { id: taskId, status: "completed", progress: 100, result, createdAt: new Date().toISOString() });
      } catch (e) {
        tasks.set(taskId, { id: taskId, status: "error", result: { error: String(e) }, createdAt: new Date().toISOString() });
      }
    })();
    res.json({ taskId, status: "queued" });
    return;
  }

  // Fallback: DALL-E cinematic frame preview
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    try {
      const imgRes = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: `${prompt.trim()}, cinematic film still, professional photography, 35mm`,
          n: 1, size: "1792x1024", quality: "hd",
        }),
      });
      if (imgRes.ok) {
        const imgData = await imgRes.json() as { data: [{ url: string }] };
        res.json({
          imageUrl: imgData.data[0].url,
          status: "image_preview",
          message: "Video generation requires RUNWAYML_API_KEY or GPU_WORKER_URL. Generated a cinematic preview frame instead.",
        });
        return;
      }
    } catch {}
  }

  res.json({
    status: "not_configured",
    message: "Add RUNWAYML_API_KEY or GPU_WORKER_URL in Admin → Settings to enable real video generation.",
  });
});

// ── POST /ai/process-video — Upload + prompt → AI video editing ───────────────
router.post("/ai/process-video", adminAuth, upload.single("video"), async (req, res): Promise<void> => {
  const { prompt = "", operation = "enhance" } = req.body as { prompt?: string; operation?: string };
  if (!req.file) { res.status(400).json({ error: "video file required" }); return; }

  const taskId = newTaskId();
  const fileUrl = `/uploads/${req.file.filename}`;
  const gpuWorkerUrl = process.env.GPU_WORKER_URL;

  if (gpuWorkerUrl) {
    tasks.set(taskId, { id: taskId, status: "queued", progress: 0, createdAt: new Date().toISOString() });
    void (async () => {
      try {
        tasks.set(taskId, { id: taskId, status: "processing", progress: 5, createdAt: new Date().toISOString() });
        const fd = new FormData();
        const fileBuffer = fs.readFileSync(req.file!.path);
        fd.append("video", new Blob([fileBuffer], { type: req.file!.mimetype }), req.file!.originalname);
        fd.append("prompt", prompt);
        fd.append("operation", operation);
        const r = await fetch(`${gpuWorkerUrl}/process-video`, { method: "POST", body: fd });
        if (r.ok) {
          tasks.set(taskId, { id: taskId, status: "completed", progress: 100, result: await r.json(), createdAt: new Date().toISOString() });
        } else {
          tasks.set(taskId, { id: taskId, status: "error", result: { error: await r.text(), fileUrl }, createdAt: new Date().toISOString() });
        }
      } catch (e) {
        tasks.set(taskId, { id: taskId, status: "error", result: { error: String(e), fileUrl }, createdAt: new Date().toISOString() });
      }
    })();
    res.json({ taskId, status: "queued", fileUrl });
  } else {
    tasks.set(taskId, {
      id: taskId, status: "needs_gpu", createdAt: new Date().toISOString(),
      result: {
        message: "GPU worker not configured. Set GPU_WORKER_URL in Settings → AI Keys to enable real-time video AI.",
        fileUrl,
        availableOps: [
          { id: "face-swap", label: "Face Swap", icon: "😊" },
          { id: "clothes-change", label: "Clothes Change", icon: "👗" },
          { id: "bg-remove", label: "Remove Background", icon: "✂️" },
          { id: "voice-convert", label: "Voice Conversion", icon: "🎙️" },
          { id: "enhance", label: "AI Enhance / Upscale", icon: "✨" },
          { id: "avatar", label: "Animate to Avatar", icon: "🎭" },
        ],
      },
    });
    res.json({ taskId, status: "needs_gpu", fileUrl });
  }
});

// ── POST /ai/process-image — Upload image + operation (bg remove, variation) ──
router.post("/ai/process-image", adminAuth, upload.single("image"), async (req, res): Promise<void> => {
  const { prompt = "", operation = "variation" } = req.body as { prompt?: string; operation?: string };
  if (!req.file) { res.status(400).json({ error: "image file required" }); return; }

  const fileUrl = `/uploads/${req.file.filename}`;
  const gpuWorkerUrl = process.env.GPU_WORKER_URL;
  const openaiKey = process.env.OPENAI_API_KEY;

  // DALL-E image variation (no GPU needed)
  if (operation === "variation" && openaiKey) {
    try {
      const fileBuffer = fs.readFileSync(req.file.path);
      const formData = new FormData();
      formData.append("image", new Blob([fileBuffer], { type: "image/png" }), "image.png");
      formData.append("n", "1");
      formData.append("size", "1024x1024");

      const r = await fetch("https://api.openai.com/v1/images/variations", {
        method: "POST",
        headers: { Authorization: `Bearer ${openaiKey}` },
        body: formData,
      });
      if (r.ok) {
        const data = await r.json() as { data: [{ url: string }] };
        res.json({ imageUrl: data.data[0].url, operation: "variation", originalUrl: fileUrl });
        return;
      }
    } catch {}
  }

  // GPU Worker for advanced ops
  if (gpuWorkerUrl) {
    const taskId = newTaskId();
    tasks.set(taskId, { id: taskId, status: "queued", progress: 0, createdAt: new Date().toISOString() });
    void (async () => {
      try {
        const fd = new FormData();
        const buf = fs.readFileSync(req.file!.path);
        fd.append("image", new Blob([buf], { type: req.file!.mimetype }), req.file!.originalname);
        fd.append("prompt", prompt);
        fd.append("operation", operation);
        const r = await fetch(`${gpuWorkerUrl}/process-image`, { method: "POST", body: fd });
        if (r.ok) {
          tasks.set(taskId, { id: taskId, status: "completed", progress: 100, result: await r.json(), createdAt: new Date().toISOString() });
        } else {
          tasks.set(taskId, { id: taskId, status: "error", result: { error: await r.text(), fileUrl }, createdAt: new Date().toISOString() });
        }
      } catch (e) {
        tasks.set(taskId, { id: taskId, status: "error", result: { error: String(e), fileUrl }, createdAt: new Date().toISOString() });
      }
    })();
    res.json({ taskId, status: "queued", fileUrl });
  } else {
    res.json({
      fileUrl,
      status: "needs_gpu",
      message: "Set GPU_WORKER_URL in Settings → AI Keys for: background removal, face swap, clothes change, AI enhance.",
    });
  }
});

// ── POST /ai/voice-clone — Clone voice from audio sample ─────────────────────
router.post("/ai/voice-clone", adminAuth, upload.single("audio"), async (req, res): Promise<void> => {
  const { text = "", voiceName = "hannah" } = req.body as { text?: string; voiceName?: string };
  if (!req.file && !text) { res.status(400).json({ error: "audio file or text required" }); return; }

  const gpuWorkerUrl = process.env.GPU_WORKER_URL;
  const elevenlabsKey = process.env.ELEVENLABS_API_KEY;
  const elevenlabsVoiceId = process.env.ELEVENLABS_VOICE_ID;

  // ElevenLabs TTS (real voice, no GPU needed)
  if (elevenlabsKey && elevenlabsVoiceId && text) {
    try {
      const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenlabsVoiceId}`, {
        method: "POST",
        headers: { "xi-api-key": elevenlabsKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.5, use_speaker_boost: true },
        }),
      });
      if (r.ok) {
        const buffer = await r.arrayBuffer();
        const filename = `voice_${Date.now()}.mp3`;
        const filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, Buffer.from(buffer));
        res.json({ audioUrl: `/uploads/${filename}`, provider: "elevenlabs" });
        return;
      }
    } catch {}
  }

  // GPU Worker (XTTS/RVC)
  if (gpuWorkerUrl) {
    try {
      const fd = new FormData();
      if (req.file) {
        const buf = fs.readFileSync(req.file.path);
        fd.append("audio", new Blob([buf], { type: req.file.mimetype }), req.file.originalname);
      }
      fd.append("text", text);
      fd.append("voiceName", voiceName);
      const r = await fetch(`${gpuWorkerUrl}/voice-clone`, { method: "POST", body: fd });
      if (r.ok) { res.json(await r.json()); return; }
    } catch {}
  }

  res.json({
    status: "not_configured",
    message: "Add ELEVENLABS_API_KEY + ELEVENLABS_VOICE_ID for real voice synthesis, or GPU_WORKER_URL for XTTS/RVC voice cloning.",
  });
});

// ── GET /ai/task/:id — Poll task status ───────────────────────────────────────
router.get("/ai/task/:id", adminAuth, (req, res): void => {
  const task = tasks.get(req.params.id);
  if (!task) { res.status(404).json({ error: "Task not found" }); return; }
  res.json(task);
});

// ── GET /ai/runway-task/:id — Poll RunwayML task ─────────────────────────────
router.get("/ai/runway-task/:id", adminAuth, async (req, res): Promise<void> => {
  const runwayKey = process.env.RUNWAYML_API_KEY;
  if (!runwayKey) { res.status(400).json({ error: "RUNWAYML_API_KEY not configured" }); return; }
  try {
    const r = await fetch(`https://api.dev.runwayml.com/v1/tasks/${req.params.id}`, {
      headers: { Authorization: `Bearer ${runwayKey}`, "X-Runway-Version": "2024-11-06" },
    });
    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
