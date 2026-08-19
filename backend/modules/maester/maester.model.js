/**
 * maester.model.js
 * MongoDB schema for Maester documents and feedback.
 */
import mongoose from "mongoose";

// ── Document metadata (stored after Python indexes it) ──────────
const maesterDocSchema = new mongoose.Schema(
  {
    docId:     { type: String, required: true, unique: true, index: true },
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    filename:  { type: String, required: true },
    pages:     { type: Number, default: 0 },
    chunks:    { type: Number, default: 0 },
    sizeBytes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ── Per-response feedback ────────────────────────────────────────
const maesterFeedbackSchema = new mongoose.Schema(
  {
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    docId:     { type: String, required: true },
    messageId: { type: String, required: true },
    query:     { type: String },
    rating:    { type: Number, min: 1, max: 5, required: true },
  },
  { timestamps: true }
);

export const MaesterDoc      = mongoose.model("MaesterDoc",      maesterDocSchema);
export const MaesterFeedback = mongoose.model("MaesterFeedback", maesterFeedbackSchema);
