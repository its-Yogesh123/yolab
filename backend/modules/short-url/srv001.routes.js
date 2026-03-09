import express from "express"
import {getRedirectUrl,generateShortUrl} from "./srv001.controller.js"
const router  = express.Router();

router.post('/url',generateShortUrl);
router.get('/url/:shortId',getRedirectUrl);
export default router;
