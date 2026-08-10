import { DailyStats, ActivityFeed } from "./analytics.model.js";
import User from "../users/user.model.js";


/**
 * GET /api/admin/analytics/summary
 * Returns today's stats + all-time aggregated totals.
 */
export const getSummary = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    // Today's document
    const todayStats = await DailyStats.findOne({ date: today }) || {
      newUsers: 0, activeUsers: 0,
      serviceUsage: { qrGenerator: 0, shortUrl: 0, imageProcessing: 0 },
    };

    // All-time aggregation across every DailyStats document
    const allTimeAgg = await DailyStats.aggregate([
      {
        $group: {
          _id: null,
          totalNewUsers:       { $sum: "$newUsers" },
          totalActiveUsers:    { $sum: "$activeUsers" },
          totalQrGenerator:    { $sum: "$serviceUsage.qrGenerator" },
          totalShortUrl:       { $sum: "$serviceUsage.shortUrl" },
          totalImageProcessing:{ $sum: "$serviceUsage.imageProcessing" },
        },
      },
    ]);

    const agg = allTimeAgg[0] || {
      totalNewUsers: 0, totalActiveUsers: 0,
      totalQrGenerator: 0, totalShortUrl: 0, totalImageProcessing: 0,
    };

    // Real total user count from Users collection (most accurate)
    const totalUsers = await User.countDocuments();

    return res.status(200).json({
      today: {
        date:        today,
        newUsers:    todayStats.newUsers,
        activeUsers: todayStats.activeUsers,
        serviceUsage: todayStats.serviceUsage,
      },
      allTime: {
        totalUsers,
        totalNewUsers:    agg.totalNewUsers,
        totalActiveUsers: agg.totalActiveUsers,
        serviceUsage: {
          qrGenerator:     agg.totalQrGenerator,
          shortUrl:        agg.totalShortUrl,
          imageProcessing: agg.totalImageProcessing,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/admin/analytics/feed
 * Returns the 50 most recent ActivityFeed entries.
 */
export const getFeed = async (req, res) => {
  try {
    const feed = await ActivityFeed.find()
      .sort({ timestamp: -1 })
      .limit(50);

    return res.status(200).json({ count: feed.length, data: feed });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/analytics/public
 * Public endpoint — returns aggregate platform stats safe to expose.
 */
export const getPublicStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const agg = await DailyStats.aggregate([
      {
        $group: {
          _id: null,
          totalQr:    { $sum: "$serviceUsage.qrGenerator" },
          totalUrl:   { $sum: "$serviceUsage.shortUrl" },
          totalImage: { $sum: "$serviceUsage.imageProcessing" },
        },
      },
    ]);

    const stats = agg[0] || { totalQr: 0, totalUrl: 0, totalImage: 0 };

    const dailyHistory = await DailyStats.find()
      .sort({ date: -1 })
      .limit(30)
      .lean();

    // Reverse to get chronological order (oldest to newest) for charts
    dailyHistory.reverse();

    return res.status(200).json({
      totalUsers,
      totalQrCodes:        stats.totalQr,
      totalShortUrls:      stats.totalUrl,
      totalImagesProcessed: stats.totalImage,
      dailyHistory:        dailyHistory,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
