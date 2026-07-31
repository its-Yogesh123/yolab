import shortid from "shortid";
import urlModel from "./srv001.model.js";
import qrcode from "qrcode";
import Subscription from "../subscription/subscription.model.js";
import { getLimitForService } from "../subscription/subscription.plans.js";

const MAX_CLICK_LOGS = 1000;

export const generateShortUrl = async (req, res) => {
  try {
    const { redirectURL, customAlias } = req.body || {};
    if (!redirectURL) {
      return res.status(400).json({ message: "redirectURL is required" });
    }
    
    // Check active URLs limit (5 for free, Infinity for pro)
    const userId = req.user.id;
    const activeUrlsCount = await urlModel.countDocuments({ createdBy: userId });
    const sub = await Subscription.findOne({ userId });
    const plan = sub ? sub.plan : 'free';
    const limit = getLimitForService(plan, 'srv001');

    if (activeUrlsCount >= limit && limit !== Infinity) {
      return res.status(429).json({
        message: `Active URL limit reached (${activeUrlsCount}/${limit}). Upgrade to Pro to create more.`,
        code: "LIMIT_REACHED"
      });
    }

    const shortId = customAlias ? customAlias.replace(/\s+/g, '-').toLowerCase() : shortid.generate();
    
    // Check if shortId exists
    const existing = await urlModel.findOne({ shortId });
    if (existing) {
       return res.status(409).json({ message: "Alias already in use. Please choose another." });
    }

    // Generate QR code for the short URL
    const fullShortUrl = `${process.env.API_URL || 'http://localhost:8000'}/s/${shortId}`;
    const qrCodeImage = await qrcode.toDataURL(fullShortUrl, { width: 300 });

    // Expiry date (30 days from now for Free, null for Pro?)
    // The prompt says "each lasts 30 days. Pro = unlimited, no expiry."
    let expiresAt = null;
    if (plan !== 'pro') {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
    }

    const doc = await urlModel.create({
      shortId,
      redirectURL,
      clickLog: [],
      totalClicks: 0,
      expiresAt,
      qrCodeImage,
      createdBy: userId,
    });
    
    return res.status(201).json({
      data: doc,
      subscription: req.subscription // from hasActiveSubscription middleware, if still used
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({
        message: "Generated shortId already exists. Please try again.",
      });
    }

    if (process.env.NODE_ENV !== 'production') console.error("Error generating short URL:", error);
    return res.status(500).json({
      message: "Internal server error while generating short URL",
    });
  }
};

export const getRedirectUrl = async (req, res) => {
  if(process.env.NODE_ENV !== 'production'){
    console.log("Redirect request received for shortId:", req.params.shortId);
  }
  try {
    const { shortId } = req.params;
    if (!shortId) {
      return res.status(400).json({ message: "shortId is required" });
    }

    const doc = await urlModel.findOne({ shortId });
    if (!doc) {
      return res.status(404).json({ message: "Short URL not found" });
    }

    // Click tracking
    const referrer = req.get('referrer') || req.get('referer') || "";
    const userAgent = req.get('user-agent') || "";
    const ip = req.ip || req.connection.remoteAddress || "";

    const newClick = { timestamp: new Date(), referrer, userAgent, ip };
    
    if (doc.clickLog.length >= MAX_CLICK_LOGS) {
       doc.clickLog.shift();
    }
    doc.clickLog.push(newClick);
    doc.totalClicks += 1;
    
    await doc.save();

    return res.redirect(doc.redirectURL);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error("Error handling short URL redirect:", error);
    return res.status(500).json({ message: "Internal server error while redirecting" });
  }
};

export const getMyUrls = async (req, res) => {
  try {
    const urls = await urlModel.find({ createdBy: req.user.id })
      .select('-clickLog') 
      .sort({ createdAt: -1 });
    
    // also fetch active url count for UI
    const limit = getLimitForService(req.user.plan || 'free', 'srv001'); // we can also fetch Subscription here if needed, but the UI might just count the returned array
    
    return res.status(200).json({ data: urls });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error("Error fetching URLs:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUrlAnalytics = async (req, res) => {
  try {
    const { shortId } = req.params;
    const doc = await urlModel.findOne({ shortId, createdBy: req.user.id });
    
    if (!doc) {
      return res.status(404).json({ message: "URL not found" });
    }

    return res.status(200).json({ data: doc });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error("Error fetching analytics:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUrl = async (req, res) => {
  try {
    const { shortId } = req.params;
    const deleted = await urlModel.findOneAndDelete({ shortId, createdBy: req.user.id });
    if (!deleted) {
      return res.status(404).json({ message: "URL not found or unauthorized" });
    }
    return res.status(200).json({ message: "URL deleted successfully" });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error("Error deleting URL:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
