import express from "express";
import {
  getMySubscription,
  upgradePlan,
  cancelSubscription,
  adminSetPlan,
} from "./subscription.controller.js";
import { isLoggedIn } from "../auth/middlewares/authenticate.js";
import { isAuthorize } from "../auth/middlewares/authorize.js";

const subscriptionRouter = express.Router();

// User routes
subscriptionRouter.get("/me", isLoggedIn, getMySubscription);
subscriptionRouter.post("/upgrade", isLoggedIn, upgradePlan);
subscriptionRouter.post("/cancel", isLoggedIn, cancelSubscription);

// Admin routes
subscriptionRouter.put(
  "/admin/:userId",
  isLoggedIn,
  isAuthorize("admin"),
  adminSetPlan
);

export default subscriptionRouter;
