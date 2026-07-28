import dotenv from "dotenv";
dotenv.config();
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../users/user.model.js";
import Subscription from "../subscription/subscription.model.js";

/**
 * Google OAuth Strategy — Find or Create user in MongoDB.
 *
 * When a Google user logs in:
 *  1. Check if a user with that googleId already exists → return them
 *  2. Check if a user with that email exists (local account) → link Google to it
 *  3. Neither → create a new user + auto-create Free subscription
 *
 * Always returns the MongoDB user document so req.user._id is a real ObjectId.
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email    = profile.emails[0].value;
        const name     = profile.displayName;
        const img      = profile.photos?.[0]?.value ?? "";

        // 1. Try to find by googleId (returning user)
        let user = await User.findOne({ googleId });

        if (!user) {
          // 2. Try to find by email (user may have registered locally before)
          user = await User.findOne({ email });

          if (user) {
            // Link Google to their existing account
            user.googleId       = googleId;
            user.img            = img;
            user.authProvider   = "googleOAuth";
            await user.save();
          } else {
            // 3. Brand-new user — create + subscription
            user = await User.create({
              name,
              email,
              googleId,
              img,
              authProvider: "googleOAuth",
            });

            // Auto-create Free subscription (same as local register)
            await Subscription.create({ userId: user._id });
          }
        }

        return done(null, user); // user._id is now a real MongoDB ObjectId
      } catch (err) {
        return done(err, null);
      }
    }
  )
);