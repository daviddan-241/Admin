import { Router, type IRouter } from "express";
import { db, chatSessionsTable, chatMessagesTable } from "@workspace/db";
import { adminAuth } from "../middleware/admin";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

// ── In-memory scheduler state ──────────────────────────────────────────────
interface PendingSuggestion {
  sessionId: number;
  fanName: string;
  fanEmail: string;
  lastFanMessage: string;
  suggestion: string;
  generatedAt: string;
}

let schedulerEnabled = false;
let schedulerIntervalMinutes = 30;
let schedulerTimer: ReturnType<typeof setInterval> | null = null;
let schedulerLastRun: string | null = null;
const pendingSuggestions = new Map<number, PendingSuggestion>();

// ── AI suggestion logic ────────────────────────────────────────────────────
function generateSuggestion(fanName: string, lastMessage: string): string {
  const txt = lastMessage.toLowerCase();
  const firstName = fanName.split(" ")[0];

  if (txt.includes("custom") || txt.includes("request") || txt.includes("commission"))
    return `Of course darling! 😍 I'd love to create something special just for you. Head to my Requests page and fill in the details — I read every single one personally! 💕`;
  if (txt.includes("call") || txt.includes("zoom") || txt.includes("whatsapp") || txt.includes("facetime"))
    return `Ooh a personal call — how exciting! 💖 I have several options on my Calls page starting from just $29.99. I'd love to spend some one-on-one time with you ${firstName}! ✨`;
  if (txt.includes("vip") || txt.includes("subscribe") || txt.includes("membership") || txt.includes("exclusive") || txt.includes("unlock"))
    return `My VIP Members section is where all the really exclusive content lives 🔥 Monthly, quarterly, or lifetime options — grab lifetime for the best value darling! 💋`;
  if (txt.includes("onlyfans") || txt.includes("only fans"))
    return `I have everything right here in my Members section — it's so much more personal! 😘 Subscribe and get instant access to all my exclusive content 💕`;
  if (txt.includes("tip") || txt.includes("send money") || txt.includes("gift") || txt.includes("support"))
    return `Aww you are so incredibly sweet ${firstName}! 🥹 You can send me a tip from the Boutique page — it truly means the world to me darling 💝`;
  if (txt.includes("love") || txt.includes("miss") || txt.includes("beautiful") || txt.includes("gorgeous") || txt.includes("pretty"))
    return `You're making me blush ${firstName}! 🥰 That is so incredibly sweet of you darling. You always know how to brighten my day 💕✨`;
  if (txt.includes("content") || txt.includes("photo") || txt.includes("picture") || txt.includes("video"))
    return `I post new content regularly darling — check my Feed for the latest! 📸 VIP members get access to everything that's a little more exclusive 😘💕`;
  if (txt.includes("when") || txt.includes("next") || txt.includes("new"))
    return `I'm always creating new things just for my fans! 💫 Make sure you're a VIP member so you never miss any of my exclusive content ${firstName} 💕`;
  if (txt.includes("thank") || txt.includes("thanks"))
    return `Of course darling! 💕 You are one of my favourite fans and I truly appreciate your support so much! You make all of this worthwhile ✨`;
  return `Hi ${firstName}! 💕 So lovely hearing from you darling! How can I make your day a little more special today? ✨ I'm all yours 😘`;
}

// ── Core scheduler scan ────────────────────────────────────────────────────
async function runScheduler(): Promise<{ scanned: number; newSuggestions: number }> {
  schedulerLastRun = new Date().toISOString();
  let scanned = 0;
  let newSuggestions = 0;

  try {
    const sessions = await db.select().from(chatSessionsTable);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    for (const session of sessions) {
      scanned++;
      if (pendingSuggestions.has(session.id)) continue;

      const msgs = await db
        .select()
        .from(chatMessagesTable)
        .where(eq(chatMessagesTable.sessionId, session.id))
        .orderBy(desc(chatMessagesTable.createdAt))
        .limit(3);

      if (msgs.length === 0) continue;
      const lastMsg = msgs[0];

      // Only suggest when last message is from fan (unanswered) and recent
      if (lastMsg.senderType !== "fan") continue;
      if (lastMsg.createdAt < oneHourAgo) continue;

      const suggestion = generateSuggestion(session.fanName, lastMsg.message);
      pendingSuggestions.set(session.id, {
        sessionId: session.id,
        fanName: session.fanName,
        fanEmail: session.fanEmail,
        lastFanMessage: lastMsg.message,
        suggestion,
        generatedAt: new Date().toISOString(),
      });
      newSuggestions++;
    }
  } catch (e) {
    console.error("[AI Scheduler] Error during scan:", e);
  }

  return { scanned, newSuggestions };
}

function startScheduler(intervalMinutes: number): void {
  if (schedulerTimer) clearInterval(schedulerTimer);
  schedulerIntervalMinutes = Math.max(5, Math.min(1440, intervalMinutes));
  schedulerEnabled = true;
  // Run immediately then on interval
  runScheduler().catch(console.error);
  schedulerTimer = setInterval(() => runScheduler().catch(console.error), schedulerIntervalMinutes * 60 * 1000);
}

function stopScheduler(): void {
  if (schedulerTimer) { clearInterval(schedulerTimer); schedulerTimer = null; }
  schedulerEnabled = false;
}

// ── Endpoints ──────────────────────────────────────────────────────────────

// GET /ai/scheduler/status
router.get("/ai/scheduler/status", adminAuth, (_req, res) => {
  res.json({
    enabled: schedulerEnabled,
    intervalMinutes: schedulerIntervalMinutes,
    lastRun: schedulerLastRun,
    pendingCount: pendingSuggestions.size,
    suggestions: Array.from(pendingSuggestions.values()),
  });
});

// POST /ai/scheduler/start
router.post("/ai/scheduler/start", adminAuth, (req, res) => {
  const { intervalMinutes = 30 } = req.body as { intervalMinutes?: number };
  startScheduler(Number(intervalMinutes) || 30);
  res.json({
    enabled: true,
    intervalMinutes: schedulerIntervalMinutes,
    message: `Scheduler started — scanning every ${schedulerIntervalMinutes} minutes`,
  });
});

// POST /ai/scheduler/stop
router.post("/ai/scheduler/stop", adminAuth, (_req, res) => {
  stopScheduler();
  res.json({ enabled: false, message: "Scheduler stopped" });
});

// POST /ai/scheduler/run-now — manual scan
router.post("/ai/scheduler/run-now", adminAuth, async (_req, res) => {
  const result = await runScheduler();
  res.json({
    ...result,
    ran: true,
    lastRun: schedulerLastRun,
    pendingCount: pendingSuggestions.size,
    suggestions: Array.from(pendingSuggestions.values()),
  });
});

// GET /ai/scheduler/suggestions
router.get("/ai/scheduler/suggestions", adminAuth, (_req, res) => {
  res.json(Array.from(pendingSuggestions.values()));
});

// POST /ai/scheduler/suggestions/:sessionId/approve — approve & send
router.post("/ai/scheduler/suggestions/:sessionId/approve", adminAuth, async (req, res): Promise<void> => {
  const sessionId = parseInt(req.params.sessionId, 10);
  const suggestion = pendingSuggestions.get(sessionId);
  if (!suggestion) { res.status(404).json({ error: "No pending suggestion for this session" }); return; }

  const { message = suggestion.suggestion } = req.body as { message?: string };
  if (!message?.trim()) { res.status(400).json({ error: "Message is empty" }); return; }

  const [session] = await db.select().from(chatSessionsTable).where(eq(chatSessionsTable.id, sessionId)).limit(1);
  if (!session) { res.status(404).json({ error: "Chat session not found" }); return; }

  const [msg] = await db.insert(chatMessagesTable).values({
    sessionId,
    senderType: "hannah",
    message: message.trim(),
    amountPaid: "0",
    isRead: true,
  }).returning();

  await db.update(chatSessionsTable)
    .set({ lastMessageAt: new Date() })
    .where(eq(chatSessionsTable.id, sessionId));

  pendingSuggestions.delete(sessionId);

  res.status(201).json({
    sent: true,
    message: { ...msg, amountPaid: Number(msg.amountPaid), createdAt: msg.createdAt.toISOString() },
  });
});

// POST /ai/scheduler/suggestions/:sessionId/dismiss
router.post("/ai/scheduler/suggestions/:sessionId/dismiss", adminAuth, (req, res) => {
  const sessionId = parseInt(req.params.sessionId, 10);
  const deleted = pendingSuggestions.delete(sessionId);
  res.json({ dismissed: deleted });
});

export default router;
