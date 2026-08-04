import express from "express";
import { getSummary, getFeed, getPublicStats } from "./analytics.controller.js";
import { isLoggedIn } from "../auth/middlewares/authenticate.js";
import { isAuthorize } from "../auth/middlewares/authorize.js";

const analyticsRouter = express.Router();

// Public: no auth required
analyticsRouter.get("/public", getPublicStats);

// Both routes: must be logged in AND have role = "admin"
analyticsRouter.get("/summary", isLoggedIn, isAuthorize("admin"), getSummary);
analyticsRouter.get("/feed",    isLoggedIn, isAuthorize("admin"), getFeed);

export default analyticsRouter;
