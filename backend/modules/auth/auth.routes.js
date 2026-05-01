import express from "express"
import passport from "passport";
import {loginWithEmailPassword,manageSession,registerWithEmailPassword,logout} from "./auth.controller.js"
import { generateToken } from "./auth.services.js";
const authRouter  = express.Router();


export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

// STEP 2 → Google redirects back here
export const googleCallback = [
  passport.authenticate("google", { session: false }),

  (req, res) => {
    console.log("Google callback req received", req.user);
    const payload = {
        id: req.user.id,
        email: req.user.email,
        role: "user",
        img: req.user.img
    };
    const token = generateToken(payload);
    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "Lax",
    });

    // Redirect to frontend
    res.redirect("http://localhost:5173");
  },
];


authRouter.post('/logout',logout);
authRouter.get('/session',manageSession);
authRouter.post('/login',loginWithEmailPassword);
authRouter.post('/register',registerWithEmailPassword);
authRouter.get("/google", googleAuth);
authRouter.get("/google/callback", googleCallback);
export default authRouter;