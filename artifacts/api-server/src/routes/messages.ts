import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, messagesTable } from "@workspace/db";
import {
  ListMessagesQueryParams,
  CreateMessageBody,
  GetMessageParams,
  UpdateMessageParams,
  UpdateMessageBody,
} from "@workspace/api-zod";
import { activityEmitter } from "../emitter";

const router: IRouter = Router();

router.get("/messages", async (req, res): Promise<void> => {
  const params = ListMessagesQueryParams.safeParse(req.query);
  let rows = await db.select().from(messagesTable).orderBy(desc(messagesTable.createdAt));
  if (params.success && params.data.status) {
    rows = rows.filter((r) => r.status === params.data.status);
  }
  res.json(rows.map((r) => ({
    ...r,
    amountPaid: Number(r.amountPaid),
    createdAt: r.createdAt.toISOString(),
  })));
});

router.post("/messages", async (req, res): Promise<void> => {
  const parsed = CreateMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db.insert(messagesTable).values({
    fanEmail: parsed.data.fanEmail,
    fanName: parsed.data.fanName,
    message: parsed.data.message,
    amountPaid: String(parsed.data.amountPaid),
    txRef: parsed.data.txRef,
    status: parsed.data.amountPaid === 0 ? "free" : "paid",
  }).returning();

  if (parsed.data.amountPaid > 0) {
    activityEmitter.emit("activity", {
      type: "message",
      fanName: parsed.data.fanName,
      amount: parsed.data.amountPaid,
      detail: `New paid message from ${parsed.data.fanName}`,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(201).json({ ...row, amountPaid: Number(row.amountPaid), createdAt: row.createdAt.toISOString() });
});

router.get("/messages/:id", async (req, res): Promise<void> => {
  const params = GetMessageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.select().from(messagesTable).where(eq(messagesTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Message not found" });
    return;
  }
  res.json({ ...row, amountPaid: Number(row.amountPaid), createdAt: row.createdAt.toISOString() });
});

router.patch("/messages/:id", async (req, res): Promise<void> => {
  const params = UpdateMessageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.reply !== undefined) {
    updateData.status = "replied";
  }
  const [row] = await db.update(messagesTable).set(updateData).where(eq(messagesTable.id, params.data.id)).returning();
  if (!row) {
    res.status(404).json({ error: "Message not found" });
    return;
  }
  res.json({ ...row, amountPaid: Number(row.amountPaid), createdAt: row.createdAt.toISOString() });
});

export default router;
