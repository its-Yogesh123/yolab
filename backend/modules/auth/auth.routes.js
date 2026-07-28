import express from "express"
import passport from "passport";
import {loginWithEmailPassword,manageSession,registerWithEmailPassword,logout} from "./auth.controller.js"
import { generateToken } from "./auth.services.js";
const authRouter  = express.Router();


export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

// STEP 2 → Google redirects back here
// req.user is now a real MongoDB User document (set by auth.passport.js)
export const googleCallback = [
  passport.authenticate("google", { session: false }),
  (req, res) => {
    if(process.env.NODE_ENV !== 'production') {
      console.log("Google callback req received", req.user._id);
    }

    // IMPORTANT: use _id (MongoDB ObjectId) NOT req.user.id (Google profile ID string)
    // This ensures all downstream queries (Subscription, QRCode, etc.) work correctly
    const payload = {
      id:    req.user._id,       // ← MongoDB ObjectId
      email: req.user.email,
      role:  req.user.role,
      img:   req.user.img ?? "",
    };

    const token = generateToken(payload);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,      // set to true in production
      sameSite: "Lax",
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    res.redirect(process.env.CLIENT_URL || "http://localhost:5173");
  },
];


authRouter.post('/logout',logout);
authRouter.get('/session',manageSession);
authRouter.post('/login',loginWithEmailPassword);
authRouter.post('/register',registerWithEmailPassword);
authRouter.get("/google", googleAuth);
authRouter.get("/google/callback", googleCallback);
export default authRouter;