import mongoose from "mongoose";

/**
 * DailyStats — One document per calendar day (YYYY-MM-DD).
 * All fields use atomic $inc so multiple writes are safe.
 */
const dailyStatsSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true, index: true }, // "2026-08-04"
  newUsers:    { type: Number, default: 0 },
  activeUsers: { type: Number, default: 0 },
  serviceUsage: {
    qrGenerator:     { type: Number, default: 0 },
    shortUrl:        { type: Number, default: 0 },
    imageProcessing: { type: Number, default: 0 },
  },
}, { timestamps: false });

export const DailyStats = mongoose.model("DailyStats", dailyStatsSchema);

/**
 * ActivityFeed — Audit log, capped at 100 entries by query (no Mongoose capped collection
 * needed — we just always query the latest 50 and delete old ones).
 */
const activityFeedSchema = new mongoose.Schema({
  timestamp:      { type: Date, default: Date.now, index: -1 },
  actionName:     { type: String, required: true },  // e.g. "Generated QR Code"
  userIdentifier: { type: String, required: true },  // email or userId string
}, { timestamps: false });

export const ActivityFeed = mongoose.model("ActivityFeed", activityFeedSchema);
