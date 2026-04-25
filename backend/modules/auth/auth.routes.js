import express from "express"
import passport from "passport";
import {loginWithEmailPassword,registerWithEmailPassword} from "./auth.controller.js"
import { generateToken } from "./auth.services.js";
const authRouter  = express.Router();

// routes/authRoutes.js



// STEP 1 → Redirect user to Google
export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

// STEP 2 → Google redirects back here
export const googleCallback = [
  passport.authenticate("google", { session: false }),

  (req, res) => {
    const payload = {
        id: req.user.id,
        email: req.user.email,
        role: "user",
    };
    const token = generateToken(payload);
    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "Lax",
    });

    // Redirect to frontend
    res.redirect("");
  },
];



authRouter.post('/login',loginWithEmailPassword);
authRouter.post('/register',registerWithEmailPassword);
// authRouter.post('/logout',);
authRouter.get("/google", googleAuth);
authRouter.get("/google/callback", googleCallback);
export default authRouter;