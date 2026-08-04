import Feedback from "./feedback.model.js";
import User from "../users/user.model.js";

/**
 * POST /api/feedback
 * Logged-in users can submit feedback (max 130 chars).
 */
export const submitFeedback = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "Feedback text is required." });
    }
    if (text.trim().length > 130) {
      return res.status(400).json({ error: "Feedback must be 130 characters or less." });
    }

    // Get user details from DB for display name
    const user = await User.findById(req.user.id).select("name email");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const feedback = await Feedback.create({
      userId:    req.user.id,
      userName:  user.name || req.user.email.split("@")[0],
      userEmail: req.user.email,
      text:      text.trim(),
    });

    return res.status(201).json({ message: "Feedback submitted!", feedback });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/feedback
 * Public endpoint — returns latest 50 feedbacks.
 */
export const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .select("userName text createdAt");

    return res.status(200).json({ feedbacks });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
