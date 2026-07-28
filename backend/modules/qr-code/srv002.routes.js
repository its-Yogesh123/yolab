import express from "express";
import { generateQRCode, getMyQRCodes, deleteQRCode } from "./srv002.controller.js";
import { hasActiveSubscription } from "../subscription/middlewares/checkSubscription.js";

const srv002Router = express.Router();

// Generate QR code (subscription-gated — Free: 10/month, Pro: unlimited)
srv002Router.post("/qr", hasActiveSubscription("srv002"), generateQRCode);

// List my QR codes (no subscription gate — just needs login, handled in server.js)
srv002Router.get("/qr", getMyQRCodes);

// Delete a QR code
srv002Router.delete("/qr/:id", deleteQRCode);

export default srv002Router;
