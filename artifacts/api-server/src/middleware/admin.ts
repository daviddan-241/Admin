import type { Request, Response, NextFunction } from "express";

export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers["x-admin-key"] as string | undefined;
  // Use live platformConfig so password changes persist without restart
  // We import lazily to avoid circular dependency at module load time
  const { platformConfig } = require("../routes/settings") as { platformConfig: { adminPassword: string } };
  const password = platformConfig.adminPassword || process.env.ADMIN_PASSWORD || "sophie2024!";
  if (!key || key !== password) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
