import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName:  { type: String, required: true },
    userEmail: { type: String, required: true },
    text:      { type: String, required: true, maxlength: 130 },
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;
