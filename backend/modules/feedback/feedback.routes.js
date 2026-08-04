import express from "express";
import { submitFeedback, getFeedbacks } from "./feedback.controller.js";
import { isLoggedIn } from "../auth/middlewares/authenticate.js";

const feedbackRouter = express.Router();

// Public: anyone can read feedback
feedbackRouter.get("/", getFeedbacks);

// Private: only logged-in users can submit
feedbackRouter.post("/", isLoggedIn, submitFeedback);

export default feedbackRouter;
