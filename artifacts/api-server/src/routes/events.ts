import { Router, type IRouter } from "express";
import { sseClients, type ActivityEvent } from "../emitter";

const router: IRouter = Router();

router.get("/events", (req, res): void => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  res.write("data: {\"type\":\"connected\"}\n\n");

  const send = (event: ActivityEvent) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  sseClients.add(send);

  const heartbeat = setInterval(() => {
    res.write(": heartbeat\n\n");
  }, 25000);

  req.on("close", () => {
    sseClients.delete(send);
    clearInterval(heartbeat);
  });
});

export default router;
