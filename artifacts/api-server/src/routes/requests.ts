import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, requestsTable } from "@workspace/db";
import { CreateRequestBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/requests", async (_req, res): Promise<void> => {
  const rows = await db.select().from(requestsTable).orderBy(desc(requestsTable.createdAt));
  res.json(rows.map((r) => ({
    ...r,
    amountPaid: Number(r.amountPaid),
    createdAt: r.createdAt.toISOString(),
  })));
});

router.post("/requests", async (req, res): Promise<void> => {
  const parsed = CreateRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(requestsTable).values({
    fanEmail: parsed.data.fanEmail,
    fanName: parsed.data.fanName,
    requestType: parsed.data.requestType,
    description: parsed.data.description,
    amountPaid: String(parsed.data.amountPaid),
    txRef: parsed.data.txRef,
    status: "pending",
  }).returning();
  res.status(201).json({ ...row, amountPaid: Number(row.amountPaid), createdAt: row.createdAt.toISOString() });
});

export default router;
