import { Router, type IRouter } from "express";
import healthRouter from "./health";
import messagesRouter from "./messages";
import callsRouter from "./calls";
import requestsRouter from "./requests";
import tipsRouter from "./tips";
import statsRouter from "./stats";
import postsRouter from "./posts";
import eventsRouter from "./events";
import adminRouter from "./admin";
import chatRouter from "./chat";
import socialRouter from "./social";

const router: IRouter = Router();

router.use(adminRouter);
router.use(eventsRouter);
router.use(healthRouter);
router.use(messagesRouter);
router.use(callsRouter);
router.use(requestsRouter);
router.use(tipsRouter);
router.use(statsRouter);
router.use(postsRouter);
router.use(chatRouter);
router.use(socialRouter);

export default router;
