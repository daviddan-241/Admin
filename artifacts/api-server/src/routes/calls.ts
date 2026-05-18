import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, callsTable } from "@workspace/db";
import {
  CreateCallBody,
  UpdateCallParams,
  UpdateCallBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/calls", async (_req, res): Promise<void> => {
  const rows = await db.select().from(callsTable).orderBy(desc(callsTable.createdAt));
  res.json(rows.map((r) => ({
    ...r,
    amountPaid: Number(r.amountPaid),
    createdAt: r.createdAt.toISOString(),
  })));
});

router.post("/calls", async (req, res): Promise<void> => {
  const parsed = CreateCallBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(callsTable).values({
    fanEmail: parsed.data.fanEmail,
    fanName: parsed.data.fanName,
    preferredDate: parsed.data.preferredDate,
    durationMinutes: parsed.data.durationMinutes,
    amountPaid: String(parsed.data.amountPaid),
    txRef: parsed.data.txRef,
    notes: parsed.data.notes ?? null,
    status: "pending",
  }).returning();
  res.status(201).json({ ...row, amountPaid: Number(row.amountPaid), createdAt: row.createdAt.toISOString() });
});

router.patch("/calls/:id", async (req, res): Promise<void> => {
  const params = UpdateCallParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateCallBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.update(callsTable).set(parsed.data).where(eq(callsTable.id, params.data.id)).returning();
  if (!row) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  res.json({ ...row, amountPaid: Number(row.amountPaid), createdAt: row.createdAt.toISOString() });
});

export default router;
