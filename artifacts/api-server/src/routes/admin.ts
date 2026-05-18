import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.post("/admin/auth", (req, res): void => {
  const { password } = req.body as { password?: string };
  const adminPassword = process.env.ADMIN_PASSWORD || "hannah2024!";
  if (password === adminPassword) {
    res.json({ authorized: true, key: adminPassword });
  } else {
    res.status(401).json({ authorized: false });
  }
});

export default router;
