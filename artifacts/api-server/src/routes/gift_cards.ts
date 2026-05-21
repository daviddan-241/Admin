import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { giftCardsTable, vipMembersTable } from "@workspace/db";
import { adminAuth } from "../middleware/admin";
import { desc, eq } from "drizzle-orm";
import path from "path";
import fs from "fs";
import { sendMail, emailAdminNewGiftCard, emailFanGiftCardReceived, emailFanGiftCardApproved, emailFanGiftCardRejected } from "../lib/mailer";
import { platformConfig } from "./settings";

const router: IRouter = Router();

async function saveBase64Image(base64: string, filename: string): Promise<string> {
  const uploadsDir = path.join(process.cwd(), "uploads", "giftcards");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  const match = base64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  const ext = match?.[1]?.split("/")?.[1] || "jpg";
  const data = match ? match[2] : base64;
  const filePath = path.join(uploadsDir, `${filename}.${ext}`);
  fs.writeFileSync(filePath, Buffer.from(data, "base64"));
  return `/uploads/giftcards/${filename}.${ext}`;
}

function calcExpiry(tier: string): Date | undefined {
  const now = new Date();
  if (tier === "monthly")   { now.setMonth(now.getMonth() + 1); return now; }
  if (tier === "quarterly") { now.setMonth(now.getMonth() + 3); return now; }
  if (tier === "lifetime")  return undefined;
  now.setMonth(now.getMonth() + 1);
  return now;
}

// POST /gift-cards — fan submits gift card
router.post("/gift-cards", async (req, res): Promise<void> => {
  const { fanName, fanEmail, cardType, cardAmount, purpose, frontImage, backImage, note } = req.body as {
    fanName?: string; fanEmail?: string; cardType?: string; cardAmount?: string;
    purpose?: string; frontImage?: string; backImage?: string; note?: string;
  };

  if (!fanName || !fanEmail || !cardType || !cardAmount || !frontImage || !backImage) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const frontImageUrl = await saveBase64Image(frontImage, `front_${id}`);
    const backImageUrl  = await saveBase64Image(backImage,  `back_${id}`);

    const [row] = await db.insert(giftCardsTable).values({
      fanName, fanEmail, cardType, cardAmount,
      purpose: purpose || "subscription",
      frontImageUrl, backImageUrl,
      note: note || null,
      status: "pending",
    }).returning();

    // Email fan: received
    const fanTpl = emailFanGiftCardReceived({ name: fanName, purpose: purpose || "subscription" });
    sendMail({ to: fanEmail, subject: fanTpl.subject, html: fanTpl.html }).catch(() => {});

    // Email admin: new gift card
    const adminEmail = (platformConfig as any).adminEmail;
    if (adminEmail) {
      const adminTpl = emailAdminNewGiftCard({ fanName, fanEmail, cardType, amount: cardAmount, purpose: purpose || "subscription" });
      sendMail({ to: adminEmail, subject: adminTpl.subject, html: adminTpl.html }).catch(() => {});
    }

    res.status(201).json({ success: true, id: row.id, message: "Gift card received! Sophie Rain will verify and unlock your access within a few hours." });
  } catch (e: unknown) {
    res.status(500).json({ error: `Failed to save gift card: ${e instanceof Error ? e.message : String(e)}` });
  }
});

// GET /gift-cards — admin view all
router.get("/gift-cards", adminAuth, async (_req, res): Promise<void> => {
  const rows = await db.select().from(giftCardsTable).orderBy(desc(giftCardsTable.createdAt));
  res.json(rows);
});

// PATCH /gift-cards/:id — admin verify/reject + unlock
router.patch("/gift-cards/:id", adminAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const { status, adminNote } = req.body as { status?: string; adminNote?: string };

  if (!status || !["approved", "rejected", "pending"].includes(status)) {
    res.status(400).json({ error: "status must be approved, rejected, or pending" });
    return;
  }

  const [row] = await db.update(giftCardsTable)
    .set({ status, adminNote: adminNote || null, verifiedAt: status === "approved" ? new Date() : null })
    .where(eq(giftCardsTable.id, id))
    .returning();

  if (!row) { res.status(404).json({ error: "Not found" }); return; }

  if (status === "approved") {
    const purpose = row.purpose || "subscription";
    const tier = purpose === "subscription" ? "monthly" : purpose;

    // Grant VIP if purpose is subscription-related
    if (["subscription", "monthly", "quarterly", "lifetime"].includes(purpose)) {
      const resolvedTier = ["monthly","quarterly","lifetime"].includes(purpose) ? purpose : "monthly";
      await db
        .insert(vipMembersTable)
        .values({
          email: row.fanEmail.toLowerCase().trim(),
          fanName: row.fanName,
          tier: resolvedTier,
          grantedBy: "gift_card",
          txRef: `gc_${row.id}`,
          notes: `Gift card #${row.id} — ${row.cardType} $${row.cardAmount}`,
          expiresAt: calcExpiry(resolvedTier) ?? null,
          isActive: true,
        })
        .onConflictDoUpdate({
          target: vipMembersTable.email,
          set: {
            tier: resolvedTier,
            grantedBy: "gift_card",
            txRef: `gc_${row.id}`,
            notes: `Gift card #${row.id} — ${row.cardType} $${row.cardAmount}`,
            expiresAt: calcExpiry(resolvedTier) ?? null,
            isActive: true,
            grantedAt: new Date(),
          },
        });
    }

    // Email fan: approved & unlocked
    const approvedTpl = emailFanGiftCardApproved({ name: row.fanName, purpose, adminNote: adminNote || undefined });
    sendMail({ to: row.fanEmail, subject: approvedTpl.subject, html: approvedTpl.html }).catch(() => {});

  } else if (status === "rejected") {
    // Email fan: rejected
    const rejTpl = emailFanGiftCardRejected({ name: row.fanName, adminNote: adminNote || undefined });
    sendMail({ to: row.fanEmail, subject: rejTpl.subject, html: rejTpl.html }).catch(() => {});
  }

  res.json(row);
});

// DELETE /gift-cards/:id
router.delete("/gift-cards/:id", adminAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  await db.delete(giftCardsTable).where(eq(giftCardsTable.id, id));
  res.status(204).send();
});

export default router;
