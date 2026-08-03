import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../users/user.model.js";
import { generateToken, validateToken } from "./auth.services.js";
import Subscription from "../subscription/subscription.model.js";
import { trackActivity } from "../analytics/analytics.services.js";

// Local database authentication with JWT
export const loginWithEmailPassword = async (req, res) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log("req Received : ",req.body);
  }
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT secret is not configured" });
    }

    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    const token  = generateToken(payload);
    res.cookie("token", token, {
      httpOnly: true,  
      secure: true,       
      sameSite: "none", 
      maxAge: 1* 24 * 60 * 60 * 1000,
    });

    // Fire-and-forget analytics (errors are caught and logged inside trackActivity)
    trackActivity({
      userIdentifier: user.email,
      actionName: "User Login",
      userId: String(user._id),
      isLogin: true,
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export const registerWithEmailPassword = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword, authProvider: "local" });

    // Auto-create a Free subscription for every new user
    await Subscription.create({ userId: newUser._id });

    const token = generateToken({ id: newUser._id, email: newUser.email, role: newUser.role });

    // Fire-and-forget analytics
    trackActivity({
      userIdentifier: newUser.email,
      actionName: "New User Registered",
      userId: String(newUser._id),
      isNewUser: true,
      isLogin: true,
    });

    return res.status(201).json({
      message: "User Registered Success",
      token,
      user: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// Logout — track the event before clearing the cookie
export const logout = (req, res) => {
  // validateToken is already imported at the top of this file.
  // Decode the cookie to get the user's email for the activity feed.
  try {
    const token = req.cookies?.token;
    if (token) {
      try {
        const decoded = validateToken(token);
        if (decoded?.email) {
          trackActivity({
            userIdentifier: decoded.email,
            actionName: "User Logout",
            userId: String(decoded.id),
          });
        }
      } catch (_) {
        // Token was invalid / expired — still proceed with logout
      }
    }
  } catch (_) {
    // silent — logout always succeeds regardless
  }

  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  return res.status(200).json({ message: "Logout Success" });
};


export const manageSession = (req,res)=>{
  if (process.env.NODE_ENV !== 'production') {
    console.log("Session check req received",req.cookies);
  }
  try{
    const token = req.cookies?.token;
    if(!token){
      return res.status(405).json({
        message:"Not Authenticated 1",
        user : null
      });
    }
    const user = validateToken(token);
    return res.status(200).json({
      message:"Success",
      user : user
    });
  }
  catch(err){
    return res.status(405).json({
      message:"Not Authenticated 2",
      user : null
    });
  }
}


