import { DailyStats, ActivityFeed } from "./analytics.model.js";

// ─── In-Memory Active Users Cache ────────────────────────────────────────────
// Map<"YYYY-MM-DD", Set<userId_string>>
// Prevents double-counting the same user as active twice on the same day.
const activeUsersCache = new Map();

function getTodayKey() {
  return new Date().toISOString().slice(0, 10); // "2026-08-04"
}

// Auto-flush the cache at midnight to free memory
function scheduleFlush() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const msUntilMidnight = midnight - now;
  setTimeout(() => {
    activeUsersCache.clear();
    scheduleFlush(); // re-schedule for next midnight
  }, msUntilMidnight);
}
scheduleFlush();

// ─── Core Fire-and-Forget Tracker ────────────────────────────────────────────
/**
 * trackActivity(options)
 * Call this from any controller — it runs async in the background and
 * NEVER throws, so it won't break the user request.
 *
 * @param {object} options
 * @param {string} options.userIdentifier  - user email or id string
 * @param {string} options.actionName      - human-readable action, e.g. "Generated QR Code"
 * @param {string} [options.userId]        - raw userId string for active-user deduplication
 * @param {string} [options.service]       - "qrGenerator" | "shortUrl" | null
 * @param {boolean} [options.isNewUser]    - true → increment newUsers counter
 * @param {boolean} [options.isLogin]      - true → check active-user cache and increment if new
 */
export function trackActivity({ userIdentifier, actionName, userId, service, isNewUser, isLogin }) {
  // Fire-and-forget: no await, no blocking
  _track({ userIdentifier, actionName, userId, service, isNewUser, isLogin }).catch(() => {});
}

async function _track({ userIdentifier, actionName, userId, service, isNewUser, isLogin }) {
  const today = getTodayKey();

  // Build the $inc payload for DailyStats
  const inc = {};

  if (isNewUser)  inc["newUsers"] = 1;
  if (service)    inc[`serviceUsage.${service}`] = 1;

  // Active users — only increment DB if user hasn't been seen today
  if (isLogin && userId) {
    const todaySet = activeUsersCache.get(today) || new Set();
    if (!todaySet.has(String(userId))) {
      todaySet.add(String(userId));
      activeUsersCache.set(today, todaySet);
      inc["activeUsers"] = 1;
    }
  }

  // Upsert today's DailyStats row
  if (Object.keys(inc).length > 0) {
    await DailyStats.findOneAndUpdate(
      { date: today },
      { $inc: inc },
      { upsert: true, new: true }
    );
  }

  // Write to ActivityFeed
  await ActivityFeed.create({ actionName, userIdentifier, timestamp: new Date() });

  // Trim ActivityFeed to latest 100 entries (cheap, runs rarely)
  const total = await ActivityFeed.countDocuments();
  if (total > 100) {
    const oldest = await ActivityFeed.find().sort({ timestamp: 1 }).limit(total - 100).select("_id");
    await ActivityFeed.deleteMany({ _id: { $in: oldest.map(d => d._id) } });
  }
}
