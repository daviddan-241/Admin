import { Router, type IRouter } from "express";
import { db, chatSessionsTable, chatMessagesTable } from "@workspace/db";
import { adminAuth } from "../middleware/admin";
import { eq, desc } from "drizzle-orm";
import { activityEmitter } from "../emitter";

const router: IRouter = Router();

// ── Image pools by scenario ────────────────────────────────────────────────
const IMAGE_POOL: Record<string, string[]> = {
  shopping: [
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=480&q=80",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=480&q=80",
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=480&q=80",
    "https://images.unsplash.com/photo-1572584642822-6f8de0243c93?w=480&q=80",
  ],
  food: [
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=480&q=80",
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=480&q=80",
    "https://images.unsplash.com/photo-1476224203421-9ac39bcb3df1?w=480&q=80",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=480&q=80",
  ],
  beach: [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=480&q=80",
    "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=480&q=80",
    "https://images.unsplash.com/photo-1473186578172-c141e6be4f55?w=480&q=80",
  ],
  gym: [
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=480&q=80",
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=480&q=80",
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=480&q=80",
  ],
  selfie: [
    "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=480&q=80",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=480&q=80",
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=480&q=80",
    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=480&q=80",
  ],
};

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function pickImg(scenario: string): string | undefined {
  const pool = IMAGE_POOL[scenario];
  return pool?.length ? pick(pool) : undefined;
}

// ── Human-like reply delay ─────────────────────────────────────────────────
function pickDelay(messageCount: number): number {
  const r = Math.random();
  if (messageCount <= 2) {
    return r < 0.55 ? 0 : Math.floor(r * 4 * 60 * 1000);
  }
  if (r < 0.12) return 0;
  if (r < 0.35) return Math.floor(Math.random() * 5 * 60 * 1000);
  if (r < 0.62) return Math.floor(Math.random() * 22 * 60 * 1000);
  if (r < 0.82) return Math.floor(Math.random() * 60 * 60 * 1000);
  return Math.floor(Math.random() * 150 * 60 * 1000);
}

// ── Enhanced suggestion type ───────────────────────────────────────────────
export interface PendingSuggestion {
  sessionId: number;
  fanName: string;
  fanEmail: string;
  lastFanMessage: string;
  suggestion: string;
  imageUrl?: string;
  isGiftCardRequest: boolean;
  humanNote: string;
  delayMs: number;
  generatedAt: string;
}

const GC_TYPES  = ["iTunes", "Apple", "Amazon", "Spotify", "Starbucks", "Target", "Netflix"] as const;
const GC_AMOUNTS = ["$25", "$50", "$15", "$30"] as const;

// ── Human-like suggestion generator ───────────────────────────────────────
function generateHumanSuggestion(
  fanName: string,
  lastMessage: string,
  messageCount: number,
): Omit<PendingSuggestion, "sessionId" | "fanName" | "fanEmail" | "lastFanMessage"> {
  const txt   = lastMessage.toLowerCase();
  const first = fanName.split(" ")[0];
  const delay = pickDelay(messageCount);

  // Gift card request — triggers naturally after engagement
  if (messageCount > 5 && Math.random() < 0.18) {
    const gc     = pick([...GC_TYPES]);
    const amount = pick([...GC_AMOUNTS]);
    return {
      suggestion: pick([
        `hey ${first} 🥺 can I ask you something small? I really need an ${gc} gift card for like ${amount} and you're honestly one of my favourites… could you help me out?? I'll make it up to you I promise 🙏💕`,
        `${first} babe 🥹 okay I hate asking but I really need help getting an ${gc} gift card rn, just ${amount}.. you're always so sweet, do you think you could? 💕`,
        `omg okay so random but I'm trying to get something on ${gc} and I'm a lil short 😅 could you grab me a ${amount} gift card?? you'd literally make my day ${first} 🙏🎀`,
      ]),
      isGiftCardRequest: true,
      humanNote: `Gift card — ${gc} ${amount}`,
      delayMs: delay,
      generatedAt: new Date().toISOString(),
    };
  }

  // Shopping context + image
  if (txt.includes("shopping") || txt.includes("mall") || txt.includes("zara") || txt.includes("store") || txt.includes("bought")) {
    return {
      suggestion: pick([
        `omg I literally just got back from shopping myself!! 🛍️ I may have gone a tiny bit overboard at Zara lol but look what I found 😅💕`,
        `girl same!! I was at the mall today too haha 🛍️ I treated myself a little, not gonna lie 😅 look!`,
        `nooo I just came back from a haul 😭🛍️ this is either really good or really bad for my bank account lol`,
      ]),
      imageUrl: pickImg("shopping"),
      isGiftCardRequest: false,
      humanNote: "Sharing shopping photo",
      delayMs: delay,
      generatedAt: new Date().toISOString(),
    };
  }

  // Food / restaurant context + image
  if (txt.includes("eat") || txt.includes("food") || txt.includes("dinner") || txt.includes("lunch") || txt.includes("restaurant") || txt.includes("hungry") || txt.includes("brunch")) {
    return {
      suggestion: pick([
        `omg I just had the best dinner out honestly 🍽️ the food was SO good look at what I ordered 😍`,
        `yess I was literally just thinking about food lol 😂 just got back from this cute spot, look!`,
        `ok I went out for dinner and I'm literally obsessed, you need to see this plate 😍🍴`,
      ]),
      imageUrl: pickImg("food"),
      isGiftCardRequest: false,
      humanNote: "Sharing food photo",
      delayMs: delay,
      generatedAt: new Date().toISOString(),
    };
  }

  // Gym context + image
  if (txt.includes("gym") || txt.includes("workout") || txt.includes("fitness") || txt.includes("training") || txt.includes("exercise")) {
    return {
      suggestion: pick([
        `girl I just got back from the gym and I'm DEAD 💀😂 but worth it right?? 🏋️‍♀️`,
        `just finished a workout and I'm so tired lol but I'm proud of myself honestly 💪😅`,
        `okay the gym is kicking my ass today but I refuse to quit lol 😂💪 look at this`,
      ]),
      imageUrl: pickImg("gym"),
      isGiftCardRequest: false,
      humanNote: "Sharing gym photo",
      delayMs: delay,
      generatedAt: new Date().toISOString(),
    };
  }

  // Beach / Miami / travel context + image
  if (txt.includes("beach") || txt.includes("pool") || txt.includes("swim") || txt.includes("miami") || txt.includes("sun") || txt.includes("vacation") || txt.includes("holiday") || txt.includes("trip")) {
    return {
      suggestion: pick([
        `miami days literally hit different 🌊☀️ I could live at the beach honestly, look at this view`,
        `omg the weather here is SO good today 🌅 had to go to the beach obv 😂💕`,
        `this is my happy place honestly 🌊✨ nothing beats a good beach day`,
      ]),
      imageUrl: pickImg("beach"),
      isGiftCardRequest: false,
      humanNote: "Sharing beach photo",
      delayMs: delay,
      generatedAt: new Date().toISOString(),
    };
  }

  // Selfie / photo request context
  if (txt.includes("pic") || txt.includes("photo") || txt.includes("picture") || txt.includes("selfie") || txt.includes("look") || txt.includes("see you") || txt.includes("show me") || txt.includes("cute")) {
    return {
      suggestion: pick([
        `literally just for you babe 😘 caught me right before my shower lol 💕`,
        `okay fine only because it's you 😏💕 you didn't see anything hehe`,
        `you asked so nicely how could I say no 🥹😘`,
        `ugh fine but you owe me lol 😂💕 just for you babe`,
      ]),
      imageUrl: pickImg("selfie"),
      isGiftCardRequest: false,
      humanNote: "Sending a selfie",
      delayMs: delay,
      generatedAt: new Date().toISOString(),
    };
  }

  // Standard conversational replies
  if (txt.includes("custom") || txt.includes("request") || txt.includes("commission"))
    return { suggestion: `of course babe!! 😍 fill in the details on my Requests page — I personally read every single one and I'll make it perfect just for you 💕`, isGiftCardRequest: false, humanNote: "Custom request", delayMs: delay, generatedAt: new Date().toISOString() };

  if (txt.includes("call") || txt.includes("zoom") || txt.includes("whatsapp") || txt.includes("facetime") || txt.includes("video chat"))
    return { suggestion: `ooh a private call 🥰 I would actually really love that!! check my Calls page babe — options starting at $29.99. spending one on one time with you sounds so good ${first} 😘`, isGiftCardRequest: false, humanNote: "Call promo", delayMs: delay, generatedAt: new Date().toISOString() };

  if (txt.includes("vip") || txt.includes("subscribe") || txt.includes("exclusive") || txt.includes("unlock") || txt.includes("membership"))
    return { suggestion: `the VIP section is literally everything 🔥 that's where I put the stuff I don't share anywhere else. monthly, quarterly, or lifetime — honestly get lifetime, it's the best deal by far darling 💋`, isGiftCardRequest: false, humanNote: "VIP promo", delayMs: delay, generatedAt: new Date().toISOString() };

  if (txt.includes("tip") || txt.includes("send money") || txt.includes("support"))
    return { suggestion: `awww ${first} you are literally the SWEETEST 🥹 you can tip from the Boutique page and it genuinely means everything to me fr 💝 you're one of the good ones`, isGiftCardRequest: false, humanNote: "Tip appreciation", delayMs: delay, generatedAt: new Date().toISOString() };

  if (txt.includes("love") || txt.includes("miss") || txt.includes("beautiful") || txt.includes("gorgeous") || txt.includes("pretty") || txt.includes("sexy") || txt.includes("hot") || txt.includes("amazing"))
    return { suggestion: `stop omg 😳🥰 you are literally making me blush so hard rn ${first}!! that seriously made my whole day better ngl 💕✨`, isGiftCardRequest: false, humanNote: "Compliment response", delayMs: delay, generatedAt: new Date().toISOString() };

  if (txt.includes("busy") || txt.includes("tired") || txt.includes("long day") || txt.includes("work") || txt.includes("stress") || txt.includes("exhausted"))
    return { suggestion: `ugh same honestly 😩 today has just been one of those days lol. hope you get some rest babe 🙏 how are you holding up? 💕`, isGiftCardRequest: false, humanNote: "Empathy response", delayMs: delay, generatedAt: new Date().toISOString() };

  if (txt.includes("thank") || txt.includes("thanks") || txt.includes("appreciate") || txt.includes("grateful"))
    return { suggestion: `of course!! honestly fans like you are literally why I do all of this 💕 you're genuinely so sweet and it means so much to me ${first} 🤍`, isGiftCardRequest: false, humanNote: "Gratitude response", delayMs: delay, generatedAt: new Date().toISOString() };

  if (txt.includes("onlyfans") || txt.includes("only fans"))
    return { suggestion: `I have everything right here in my Members section — honestly it's so much more personal than OF 😘 subscribe and get instant access to all my exclusive content 💕`, isGiftCardRequest: false, humanNote: "OF redirect", delayMs: delay, generatedAt: new Date().toISOString() };

  // Casual / default variety
  return {
    suggestion: pick([
      `heyyy ${first}!! 💕 omg so good to hear from you!! what are you up to today? 😊`,
      `omg hi!! 🥰 I was literally just thinking about my favourite fans! how are you doing?? 💕`,
      `hey!! 😘 okay you literally just made me smile, what are you up to? ✨`,
      `${first}!! 😊 this made me smile ngl hehe 💕 how's your day going??`,
      `heyy babe 💕 just got back from the most random day lol — what's going on with you?? 😘`,
      `omg ${first} you have perfect timing I was literally just chilling 😂💕 what are you up to??`,
      `okay this literally made my day 🥰 how are you ${first}?? 💕 tell me everything`,
    ]),
    isGiftCardRequest: false,
    humanNote: "Casual greeting",
    delayMs: delay,
    generatedAt: new Date().toISOString(),
  };
}

// ── In-memory state ────────────────────────────────────────────────────────
let schedulerEnabled = false;
let schedulerIntervalMinutes = 30;
let schedulerTimer: ReturnType<typeof setInterval> | null = null;
let schedulerLastRun: string | null = null;
const pendingSuggestions = new Map<number, PendingSuggestion>();

// ── Scheduled / delayed reply queue ───────────────────────────────────────
interface ScheduledReply {
  sessionId: number;
  fanName: string;
  message: string;
  imageUrl?: string;
  scheduledAt: string;
  sendAt: string;
  timeoutId: ReturnType<typeof setTimeout>;
}
const scheduledReplies = new Map<number, ScheduledReply>();

async function sendScheduledReply(sessionId: number): Promise<void> {
  const s = scheduledReplies.get(sessionId);
  if (!s) return;
  scheduledReplies.delete(sessionId);
  pendingSuggestions.delete(sessionId);

  try {
    const [session] = await db.select().from(chatSessionsTable).where(eq(chatSessionsTable.id, sessionId)).limit(1);
    if (!session) return;

    await db.insert(chatMessagesTable).values({
      sessionId, senderType: "hannah", message: s.message, amountPaid: "0", isRead: true,
    });

    if (s.imageUrl) {
      await db.insert(chatMessagesTable).values({
        sessionId, senderType: "hannah",
        message: `[ATTACHMENT]${JSON.stringify({ type: "image", url: s.imageUrl, name: "photo.jpg", size: 0 })}`,
        amountPaid: "0", isRead: true,
      });
    }

    await db.update(chatSessionsTable).set({ lastMessageAt: new Date() }).where(eq(chatSessionsTable.id, sessionId));
    activityEmitter.emit("activity", {
      type: "message", fanName: session.fanName, amount: 0,
      detail: `Hannah replied to ${session.fanName} (auto-scheduled)`, timestamp: new Date().toISOString(),
    });
  } catch (e) { console.error("[Scheduler] Error sending scheduled reply:", e); }
}

function scheduleReply(sessionId: number, fanName: string, message: string, delayMs: number, imageUrl?: string): string {
  const existing = scheduledReplies.get(sessionId);
  if (existing) clearTimeout(existing.timeoutId);
  const sendAt = new Date(Date.now() + delayMs).toISOString();
  const timeoutId = setTimeout(() => sendScheduledReply(sessionId), delayMs);
  scheduledReplies.set(sessionId, { sessionId, fanName, message, imageUrl, scheduledAt: new Date().toISOString(), sendAt, timeoutId });
  return sendAt;
}

// ── Core scheduler scan ────────────────────────────────────────────────────
async function runScheduler(): Promise<{ scanned: number; newSuggestions: number }> {
  schedulerLastRun = new Date().toISOString();
  let scanned = 0, newSuggestions = 0;

  try {
    const sessions = await db.select().from(chatSessionsTable);
    const threeHrsAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);

    for (const session of sessions) {
      scanned++;
      if (pendingSuggestions.has(session.id) || scheduledReplies.has(session.id)) continue;

      const msgs = await db.select().from(chatMessagesTable)
        .where(eq(chatMessagesTable.sessionId, session.id))
        .orderBy(desc(chatMessagesTable.createdAt))
        .limit(20);

      if (!msgs.length) continue;
      const last = msgs[0];
      if (last.senderType !== "fan") continue;
      if (last.createdAt < threeHrsAgo) continue;

      const partial = generateHumanSuggestion(session.fanName, last.message, msgs.length);
      const sug: PendingSuggestion = { sessionId: session.id, fanName: session.fanName, fanEmail: session.fanEmail, lastFanMessage: last.message, ...partial };
      pendingSuggestions.set(session.id, sug);
      newSuggestions++;
    }
  } catch (e) { console.error("[AI Scheduler] Scan error:", e); }
  return { scanned, newSuggestions };
}

function startScheduler(intervalMinutes: number): void {
  if (schedulerTimer) clearInterval(schedulerTimer);
  schedulerIntervalMinutes = Math.max(5, Math.min(1440, intervalMinutes));
  schedulerEnabled = true;
  runScheduler().catch(console.error);
  schedulerTimer = setInterval(() => runScheduler().catch(console.error), schedulerIntervalMinutes * 60 * 1000);
}
function stopScheduler(): void {
  if (schedulerTimer) { clearInterval(schedulerTimer); schedulerTimer = null; }
  schedulerEnabled = false;
}

// ── Endpoints ──────────────────────────────────────────────────────────────

router.get("/ai/scheduler/status", adminAuth, (_req, res) => {
  res.json({
    enabled: schedulerEnabled,
    intervalMinutes: schedulerIntervalMinutes,
    lastRun: schedulerLastRun,
    pendingCount: pendingSuggestions.size,
    suggestions: Array.from(pendingSuggestions.values()),
    scheduledReplies: Array.from(scheduledReplies.values()).map(s => ({
      sessionId: s.sessionId, fanName: s.fanName, sendAt: s.sendAt, scheduledAt: s.scheduledAt,
      message: s.message.slice(0, 80), imageUrl: s.imageUrl,
    })),
  });
});

router.post("/ai/scheduler/start", adminAuth, (req, res) => {
  const { intervalMinutes = 30 } = req.body as { intervalMinutes?: number };
  startScheduler(Number(intervalMinutes) || 30);
  res.json({ enabled: true, intervalMinutes: schedulerIntervalMinutes, message: `Scheduler started — every ${schedulerIntervalMinutes} min` });
});

router.post("/ai/scheduler/stop", adminAuth, (_req, res) => {
  stopScheduler();
  res.json({ enabled: false, message: "Scheduler stopped" });
});

router.post("/ai/scheduler/run-now", adminAuth, async (_req, res) => {
  const result = await runScheduler();
  res.json({ ...result, ran: true, lastRun: schedulerLastRun, pendingCount: pendingSuggestions.size, suggestions: Array.from(pendingSuggestions.values()) });
});

router.get("/ai/scheduler/suggestions", adminAuth, (_req, res) => {
  res.json(Array.from(pendingSuggestions.values()));
});

// POST /ai/scheduler/suggestions/:sessionId/approve — send now OR schedule with delay
router.post("/ai/scheduler/suggestions/:sessionId/approve", adminAuth, async (req, res): Promise<void> => {
  const sessionId = parseInt(req.params.sessionId, 10);
  const suggestion = pendingSuggestions.get(sessionId);
  if (!suggestion) { res.status(404).json({ error: "No pending suggestion" }); return; }

  const { message = suggestion.suggestion, imageUrl = suggestion.imageUrl, scheduleDelayMs } = req.body as { message?: string; imageUrl?: string; scheduleDelayMs?: number };
  if (!message?.trim()) { res.status(400).json({ error: "Message is empty" }); return; }

  const [session] = await db.select().from(chatSessionsTable).where(eq(chatSessionsTable.id, sessionId)).limit(1);
  if (!session) { res.status(404).json({ error: "Session not found" }); return; }

  if (scheduleDelayMs && scheduleDelayMs > 0) {
    const sendAt = scheduleReply(sessionId, session.fanName, message.trim(), scheduleDelayMs, imageUrl);
    pendingSuggestions.delete(sessionId);
    res.json({ scheduled: true, sendAt });
    return;
  }

  // Send immediately
  const [msg] = await db.insert(chatMessagesTable).values({
    sessionId, senderType: "hannah", message: message.trim(), amountPaid: "0", isRead: true,
  }).returning();

  if (imageUrl) {
    await db.insert(chatMessagesTable).values({
      sessionId, senderType: "hannah",
      message: `[ATTACHMENT]${JSON.stringify({ type: "image", url: imageUrl, name: "photo.jpg", size: 0 })}`,
      amountPaid: "0", isRead: true,
    });
  }

  await db.update(chatSessionsTable).set({ lastMessageAt: new Date() }).where(eq(chatSessionsTable.id, sessionId));
  pendingSuggestions.delete(sessionId);

  activityEmitter.emit("activity", { type: "message", fanName: session.fanName, amount: 0, detail: `Hannah replied to ${session.fanName}`, timestamp: new Date().toISOString() });

  res.status(201).json({ sent: true, message: { ...msg, amountPaid: Number(msg.amountPaid), createdAt: msg.createdAt.toISOString() } });
});

// GET /ai/scheduler/scheduled — list pending auto-sends
router.get("/ai/scheduler/scheduled", adminAuth, (_req, res) => {
  res.json(Array.from(scheduledReplies.values()).map(s => ({
    sessionId: s.sessionId, fanName: s.fanName, sendAt: s.sendAt, scheduledAt: s.scheduledAt,
    message: s.message.slice(0, 80), imageUrl: s.imageUrl,
  })));
});

// DELETE /ai/scheduler/scheduled/:sessionId — cancel
router.delete("/ai/scheduler/scheduled/:sessionId", adminAuth, (req, res) => {
  const sessionId = parseInt(req.params.sessionId, 10);
  const s = scheduledReplies.get(sessionId);
  if (!s) { res.status(404).json({ error: "No scheduled reply" }); return; }
  clearTimeout(s.timeoutId);
  scheduledReplies.delete(sessionId);
  res.json({ cancelled: true });
});

// POST /ai/scheduler/suggestions/:sessionId/dismiss
router.post("/ai/scheduler/suggestions/:sessionId/dismiss", adminAuth, (req, res) => {
  const sessionId = parseInt(req.params.sessionId, 10);
  pendingSuggestions.delete(sessionId);
  res.json({ dismissed: true });
});

export default router;
