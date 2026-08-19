/**
 * maester.routes.js
 * Routes for the Maester PDF chat service (Node gateway).
 *
 * All routes require isLoggedIn (applied in server.js).
 * Upload endpoint uses multer with memory storage (PDF only, ≤10 MB).
 */
import { Router } from "express";
import multer from "multer";
import {
  uploadPdf,
  queryDocument,
  submitFeedback,
  getMyDocs,
  deleteDoc,
} from "./maester.controller.js";

const router = Router();

// ── Multer — PDF only, 10 MB limit ───────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype === "application/pdf" ||
      (file.mimetype === "application/octet-stream" &&
        (file.originalname || "").toLowerCase().endsWith(".pdf"))
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are accepted."));
    }
  },
});

// ── Routes ────────────────────────────────────────────────────────

/**
 * POST /api/maester/upload
 * Body (multipart): file (PDF ≤10 MB)
 * Response: { docId, pages, chunks, message }
 */
router.post("/upload", upload.single("file"), uploadPdf);

/**
 * POST /api/maester/query
 * Body (JSON): { docId, query, history? }
 * Response: { answer, sources }
 */
router.post("/query", queryDocument);

/**
 * POST /api/maester/feedback
 * Body (JSON): { docId, messageId, query?, rating (1-5) }
 */
router.post("/feedback", submitFeedback);

/**
 * GET /api/maester/docs
 * Response: { data: [ ...MaesterDoc ] }
 */
router.get("/docs", getMyDocs);

/**
 * DELETE /api/maester/docs/:docId
 */
router.delete("/docs/:docId", deleteDoc);

// ── Multer error handler ──────────────────────────────────────────
router.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  if (err?.message?.includes("Only PDF")) {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: "Internal server error." });
});

export default router;
