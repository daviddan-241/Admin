import type { Request, Response, NextFunction } from "express";

export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers["x-admin-key"] as string | undefined;
  const password = process.env.ADMIN_PASSWORD || "sophie2024!";
  if (!key || key !== password) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
