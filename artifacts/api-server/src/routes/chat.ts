import { Router, type IRouter } from "express";
import { eq, desc, gt, and } from "drizzle-orm";
import { db, chatSessionsTable, chatMessagesTable } from "@workspace/db";
import { adminAuth } from "../middleware/admin";
import { activityEmitter } from "../emitter";

const router: IRouter = Router();
const FREE_LIMIT = 5;

function serializeSession(s: typeof chatSessionsTable.$inferSelect) {
  return {
    ...s,
    lastMessageAt: s.lastMessageAt?.toISOString() ?? null,
    createdAt: s.createdAt.toISOString(),
  };
}
function serializeMsg(m: typeof chatMessagesTable.$inferSelect) {
  return { ...m, amountPaid: Number(m.amountPaid), createdAt: m.createdAt.toISOString() };
}

// POST /chat/start — create or resume a session
router.post("/chat/start", async (req, res): Promise<void> => {
  const { email, name } = req.body as { email?: string; name?: string };
  if (!email || !name) { res.status(400).json({ error: "email and name required" }); return; }

  const existing = await db.select().from(chatSessionsTable).where(eq(chatSessionsTable.fanEmail, email.toLowerCase())).limit(1);
  if (existing[0]) {
    const msgs = await db.select().from(chatMessagesTable).where(eq(chatMessagesTable.sessionId, existing[0].id)).orderBy(chatMessagesTable.createdAt);
    res.json({ session: serializeSession(existing[0]), messages: msgs.map(serializeMsg), freeLimit: FREE_LIMIT });
    return;
  }

  const [session] = await db.insert(chatSessionsTable).values({ fanEmail: email.toLowerCase(), fanName: name }).returning();
  res.status(201).json({ session: serializeSession(session), messages: [], freeLimit: FREE_LIMIT });
});

// GET /chat/:token — get session + messages
router.get("/chat/:token", async (req, res): Promise<void> => {
  const [session] = await db.select().from(chatSessionsTable).where(eq(chatSessionsTable.fanToken, req.params.token)).limit(1);
  if (!session) { res.status(404).json({ error: "Session not found" }); return; }
  const msgs = await db.select().from(chatMessagesTable).where(eq(chatMessagesTable.sessionId, session.id)).orderBy(chatMessagesTable.createdAt);
  res.json({ session: serializeSession(session), messages: msgs.map(serializeMsg), freeLimit: FREE_LIMIT });
});

// GET /chat/:token/poll?since=ISO — poll for new messages
router.get("/chat/:token/poll", async (req, res): Promise<void> => {
  const [session] = await db.select().from(chatSessionsTable).where(eq(chatSessionsTable.fanToken, req.params.token)).limit(1);
  if (!session) { res.status(404).json({ error: "Session not found" }); return; }
  const since = req.query.since ? new Date(req.query.since as string) : new Date(0);
  const msgs = await db.select().from(chatMessagesTable).where(
    and(eq(chatMessagesTable.sessionId, session.id), gt(chatMessagesTable.createdAt, since))
  ).orderBy(chatMessagesTable.createdAt);
  res.json({ messages: msgs.map(serializeMsg), freeUsed: session.freeUsed });
});

// POST /chat/:token/send — fan sends message
router.post("/chat/:token/send", async (req, res): Promise<void> => {
  const [session] = await db.select().from(chatSessionsTable).where(eq(chatSessionsTable.fanToken, req.params.token)).limit(1);
  if (!session) { res.status(404).json({ error: "Session not found" }); return; }

  const { message, txRef, amountPaid } = req.body as { message?: string; txRef?: string; amountPaid?: number };
  if (!message?.trim()) { res.status(400).json({ error: "Message required" }); return; }

  const isFree = session.freeUsed < FREE_LIMIT;
  if (!isFree && (!txRef || !amountPaid)) {
    res.status(402).json({ error: "Payment required", freeUsed: session.freeUsed, freeLimit: FREE_LIMIT });
    return;
  }

  const paid = isFree ? 0 : (amountPaid ?? 0);

  const [msg] = await db.insert(chatMessagesTable).values({
    sessionId: session.id,
    senderType: "fan",
    message: message.trim(),
    amountPaid: String(paid),
    txRef: txRef ?? null,
    isRead: false,
  }).returning();

  await db.update(chatSessionsTable).set({
    freeUsed: isFree ? session.freeUsed + 1 : session.freeUsed,
    lastMessageAt: new Date(),
  }).where(eq(chatSessionsTable.id, session.id));

  if (!isFree && paid > 0) {
    activityEmitter.emit("activity", {
      type: "message",
      fanName: session.fanName,
      amount: paid,
      detail: `Paid message from ${session.fanName}: "${message.slice(0, 40)}…"`,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(201).json(serializeMsg(msg));
});

// GET /chat/admin/sessions — all sessions (admin only)
router.get("/chat/admin/sessions", adminAuth, async (_req, res): Promise<void> => {
  const sessions = await db.select().from(chatSessionsTable).orderBy(desc(chatSessionsTable.lastMessageAt));
  const result = await Promise.all(sessions.map(async (s) => {
    const msgs = await db.select().from(chatMessagesTable).where(eq(chatMessagesTable.sessionId, s.id)).orderBy(desc(chatMessagesTable.createdAt)).limit(1);
    const unread = await db.select().from(chatMessagesTable).where(
      and(eq(chatMessagesTable.sessionId, s.id), eq(chatMessagesTable.senderType, "fan"), eq(chatMessagesTable.isRead, false))
    );
    return { ...serializeSession(s), lastMessage: msgs[0] ? serializeMsg(msgs[0]) : null, unreadCount: unread.length };
  }));
  res.json(result);
});

// GET /chat/admin/:sessionId/messages — get all messages for a session (admin)
router.get("/chat/admin/:sessionId/messages", adminAuth, async (req, res): Promise<void> => {
  const sessionId = parseInt(req.params.sessionId, 10);
  const [session] = await db.select().from(chatSessionsTable).where(eq(chatSessionsTable.id, sessionId)).limit(1);
  if (!session) { res.status(404).json({ error: "Session not found" }); return; }
  const msgs = await db.select().from(chatMessagesTable).where(eq(chatMessagesTable.sessionId, sessionId)).orderBy(chatMessagesTable.createdAt);
  // mark as read
  await db.update(chatMessagesTable).set({ isRead: true }).where(
    and(eq(chatMessagesTable.sessionId, sessionId), eq(chatMessagesTable.senderType, "fan"))
  );
  res.json({ session: serializeSession(session), messages: msgs.map(serializeMsg) });
});

// POST /chat/admin/:sessionId/reply — Hannah replies (admin only)
router.post("/chat/admin/:sessionId/reply", adminAuth, async (req, res): Promise<void> => {
  const sessionId = parseInt(req.params.sessionId, 10);
  const { message } = req.body as { message?: string };
  if (!message?.trim()) { res.status(400).json({ error: "Message required" }); return; }

  const [session] = await db.select().from(chatSessionsTable).where(eq(chatSessionsTable.id, sessionId)).limit(1);
  if (!session) { res.status(404).json({ error: "Session not found" }); return; }

  const [msg] = await db.insert(chatMessagesTable).values({
    sessionId,
    senderType: "hannah",
    message: message.trim(),
    amountPaid: "0",
    isRead: true,
  }).returning();

  await db.update(chatSessionsTable).set({ lastMessageAt: new Date() }).where(eq(chatSessionsTable.id, sessionId));

  // Notify fan's SSE
  activityEmitter.emit("activity", {
    type: "message",
    fanName: session.fanName,
    amount: 0,
    detail: `Hannah replied to ${session.fanName}`,
    timestamp: new Date().toISOString(),
  });

  res.status(201).json(serializeMsg(msg));
});

export default router;
