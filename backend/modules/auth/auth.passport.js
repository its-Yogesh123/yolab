import dotenv from "dotenv";
dotenv.config();
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extract data from Google profile
        const user = {
          id: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          img: profile.photos[0].value,
        };
        console.log("After Google Authentication : ",profile);
        // 🔥 Replace this with DB logic:
        // find user OR create user

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);