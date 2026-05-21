import { Router, type IRouter } from "express";
import { db, vipMembersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { adminAuth } from "../middleware/admin";
import { sendMail, emailFanVipGranted } from "../lib/mailer";
import { platformConfig } from "./settings";

const router: IRouter = Router();

// POST /vip/check — public: fan checks their own VIP status by email
router.post("/vip/check", async (req, res): Promise<void> => {
  const { email } = req.body as { email?: string };
  if (!email) { res.status(400).json({ error: "email required" }); return; }
  const [row] = await db
    .select()
    .from(vipMembersTable)
    .where(eq(vipMembersTable.email, email.toLowerCase().trim()))
    .limit(1);
  if (!row || !row.isActive) {
    res.json({ isVip: false });
    return;
  }
  const expired = row.expiresAt && row.expiresAt < new Date();
  res.json({
    isVip: !expired,
    tier: row.tier,
    expiresAt: row.expiresAt?.toISOString() ?? null,
    grantedAt: row.grantedAt.toISOString(),
  });
});

// GET /vip — admin: list all VIP members
router.get("/vip", adminAuth, async (_req, res): Promise<void> => {
  const rows = await db.select().from(vipMembersTable).orderBy(desc(vipMembersTable.grantedAt));
  res.json(rows.map(r => ({
    ...r,
    grantedAt: r.grantedAt.toISOString(),
    expiresAt: r.expiresAt?.toISOString() ?? null,
  })));
});

// POST /vip/grant — admin: grant VIP to a fan
router.post("/vip/grant", adminAuth, async (req, res): Promise<void> => {
  const { email, fanName, tier, grantedBy, txRef, notes, expiresAt } = req.body as {
    email?: string; fanName?: string; tier?: string; grantedBy?: string;
    txRef?: string; notes?: string; expiresAt?: string;
  };
  if (!email) { res.status(400).json({ error: "email required" }); return; }

  const expiresDate = expiresAt ? new Date(expiresAt) : calcExpiry(tier || "monthly");

  const [row] = await db
    .insert(vipMembersTable)
    .values({
      email: email.toLowerCase().trim(),
      fanName: fanName || null,
      tier: tier || "monthly",
      grantedBy: grantedBy || "admin",
      txRef: txRef || null,
      notes: notes || null,
      expiresAt: expiresDate,
      isActive: true,
    })
    .onConflictDoUpdate({
      target: vipMembersTable.email,
      set: {
        tier: tier || "monthly",
        grantedBy: grantedBy || "admin",
        txRef: txRef || null,
        notes: notes || null,
        expiresAt: expiresDate,
        isActive: true,
        grantedAt: new Date(),
      },
    })
    .returning();

  // Send welcome email to fan
  const adminEmail = (platformConfig as any).adminEmail || "";
  const tplFan = emailFanVipGranted({ name: fanName || email, tier: tier || "monthly" });
  sendMail({ to: email, subject: tplFan.subject, html: tplFan.html }).catch(() => {});

  res.status(201).json({ ...row, grantedAt: row.grantedAt.toISOString(), expiresAt: row.expiresAt?.toISOString() ?? null });
});

// PATCH /vip/:id — admin: update/revoke
router.patch("/vip/:id", adminAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const { isActive, tier, expiresAt, notes } = req.body as {
    isActive?: boolean; tier?: string; expiresAt?: string; notes?: string;
  };
  const updates: Partial<typeof vipMembersTable.$inferInsert> = {};
  if (isActive !== undefined) updates.isActive = isActive;
  if (tier) updates.tier = tier;
  if (expiresAt) updates.expiresAt = new Date(expiresAt);
  if (notes !== undefined) updates.notes = notes;
  const [row] = await db.update(vipMembersTable).set(updates).where(eq(vipMembersTable.id, id)).returning();
  res.json({ ...row, grantedAt: row.grantedAt.toISOString(), expiresAt: row.expiresAt?.toISOString() ?? null });
});

// DELETE /vip/:id — admin: remove
router.delete("/vip/:id", adminAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  await db.delete(vipMembersTable).where(eq(vipMembersTable.id, id));
  res.status(204).send();
});

function calcExpiry(tier: string): Date | undefined {
  const now = new Date();
  if (tier === "monthly") { now.setMonth(now.getMonth() + 1); return now; }
  if (tier === "quarterly") { now.setMonth(now.getMonth() + 3); return now; }
  if (tier === "lifetime") return undefined;
  now.setMonth(now.getMonth() + 1);
  return now;
}

export default router;
