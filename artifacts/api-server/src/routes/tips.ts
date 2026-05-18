import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, tipsTable } from "@workspace/db";
import { CreateTipBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/tips", async (_req, res): Promise<void> => {
  const rows = await db.select().from(tipsTable).orderBy(desc(tipsTable.createdAt));
  res.json(rows.map((r) => ({
    ...r,
    amount: Number(r.amount),
    createdAt: r.createdAt.toISOString(),
  })));
});

router.post("/tips", async (req, res): Promise<void> => {
  const parsed = CreateTipBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(tipsTable).values({
    fanEmail: parsed.data.fanEmail,
    fanName: parsed.data.fanName,
    amount: String(parsed.data.amount),
    txRef: parsed.data.txRef,
    message: parsed.data.message ?? null,
  }).returning();
  res.status(201).json({ ...row, amount: Number(row.amount), createdAt: row.createdAt.toISOString() });
});

export default router;
