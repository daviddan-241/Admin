import { Router, type IRouter } from "express";
import { db, messagesTable, callsTable, requestsTable, tipsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/stats", async (_req, res): Promise<void> => {
  const [msgCount] = await db.select({ count: sql<number>`count(*)::int` }).from(messagesTable);
  const [callCount] = await db.select({ count: sql<number>`count(*)::int` }).from(callsTable);
  const [reqCount] = await db.select({ count: sql<number>`count(*)::int` }).from(requestsTable);
  const [tipCount] = await db.select({ count: sql<number>`count(*)::int` }).from(tipsTable);

  const [msgRev] = await db.select({ total: sql<number>`coalesce(sum(amount_paid::numeric), 0)::float` }).from(messagesTable);
  const [callRev] = await db.select({ total: sql<number>`coalesce(sum(amount_paid::numeric), 0)::float` }).from(callsTable);
  const [reqRev] = await db.select({ total: sql<number>`coalesce(sum(amount_paid::numeric), 0)::float` }).from(requestsTable);
  const [tipRev] = await db.select({ total: sql<number>`coalesce(sum(amount::numeric), 0)::float` }).from(tipsTable);

  res.json({
    totalMessages: msgCount.count,
    totalCalls: callCount.count,
    totalRequests: reqCount.count,
    totalTips: tipCount.count,
    totalRevenue: (msgRev.total + callRev.total + reqRev.total + tipRev.total),
  });
});

export default router;
