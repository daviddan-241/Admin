import { Router, type IRouter } from "express";
import healthRouter from "./health";
import messagesRouter from "./messages";
import callsRouter from "./calls";
import requestsRouter from "./requests";
import tipsRouter from "./tips";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(messagesRouter);
router.use(callsRouter);
router.use(requestsRouter);
router.use(tipsRouter);
router.use(statsRouter);

export default router;
