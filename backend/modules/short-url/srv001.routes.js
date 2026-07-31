import express from "express";
import { generateShortUrl, getMyUrls, getUrlAnalytics, deleteUrl } from "./srv001.controller.js";
import { hasActiveSubscription } from "../subscription/middlewares/checkSubscription.js";

const router = express.Router();

router.post('/url', hasActiveSubscription('srv001'), generateShortUrl);
router.get('/my-urls', getMyUrls);
router.get('/analytics/:shortId', getUrlAnalytics);
router.delete('/url/:shortId', deleteUrl);

export default router;
