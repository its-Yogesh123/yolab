/**
 * maester.controller.js
 *
 * Node gateway controllers for the Maester PDF chat service.
 * All heavy processing (PDF extraction, embedding, retrieval, LLM)
 * is delegated to the Python FastAPI service.
 */
import axios from "axios";
import FormData from "form-data";
import { MaesterDoc, MaesterFeedback } from "./maester.model.js";

const PYTHON_URL = process.env.MAESTER_PYTHON_URL || "http://localhost:8002";

// ── Helpers ─────────────────────────────────────────────────────

function pythonError(err, res) {
  if (err.response) {
    const detail = err.response.data?.detail || "Python service error.";
    return res.status(err.response.status).json({ message: detail });
  }
  if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
    return res.status(503).json({ message: "Maester processing service is offline. Please try again later." });
  }
  console.error("[maester] unexpected error:", err.message);
  return res.status(500).json({ message: "Internal server error." });
}

// ── Upload ───────────────────────────────────────────────────────

/**
 * POST /api/maester/upload
 * Forwards the PDF to the Python service, records metadata in MongoDB.
 */
export const uploadPdf = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No PDF file uploaded." });
  }

  const form = new FormData();
  form.append("file", req.file.buffer, {
    filename:    req.file.originalname || "upload.pdf",
    contentType: req.file.mimetype,
  });

  try {
    const pyRes = await axios.post(`${PYTHON_URL}/maester/upload`, form, {
      headers: form.getHeaders(),
      timeout: 120_000, // large PDFs can take a while to embed
    });

    const { doc_id, pages, chunks } = pyRes.data;

    // Persist metadata in MongoDB
    await MaesterDoc.create({
      docId:     doc_id,
      userId:    req.user.id,
      filename:  req.file.originalname || "upload.pdf",
      pages,
      chunks,
      sizeBytes: req.file.size,
    });

    return res.status(200).json({
      docId:   doc_id,
      pages,
      chunks,
      message: "PDF indexed successfully.",
    });
  } catch (err) {
    return pythonError(err, res);
  }
};

// ── Query ────────────────────────────────────────────────────────

/**
 * POST /api/maester/query
 * Forwards the question + docId to Python, returns {answer, sources}.
 */
export const queryDocument = async (req, res) => {
  const { docId, query, history } = req.body;

  if (!docId) return res.status(400).json({ message: "docId is required." });
  if (!query || !query.trim()) return res.status(400).json({ message: "query cannot be empty." });

  // Verify the doc belongs to this user (ownership check)
  const doc = await MaesterDoc.findOne({ docId, userId: req.user.id });
  if (!doc) {
    return res.status(404).json({ message: "Document not found or access denied." });
  }

  try {
    const pyRes = await axios.post(
      `${PYTHON_URL}/maester/query`,
      { doc_id: docId, query, history: history || [] },
      { timeout: 60_000 }
    );

    return res.status(200).json(pyRes.data);
  } catch (err) {
    return pythonError(err, res);
  }
};

// ── Feedback ─────────────────────────────────────────────────────

/**
 * POST /api/maester/feedback
 * Stores a 1-5 star rating for a specific AI response.
 */
export const submitFeedback = async (req, res) => {
  const { docId, messageId, query, rating } = req.body;

  if (!docId || !messageId) {
    return res.status(400).json({ message: "docId and messageId are required." });
  }
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "rating must be between 1 and 5." });
  }

  await MaesterFeedback.create({
    userId:    req.user.id,
    docId,
    messageId,
    query:     query || "",
    rating:    Number(rating),
  });

  return res.status(200).json({ message: "Feedback recorded. Thank you!" });
};

// ── User documents list ───────────────────────────────────────────

/**
 * GET /api/maester/docs
 * Lists documents uploaded by the logged-in user.
 */
export const getMyDocs = async (req, res) => {
  const docs = await MaesterDoc.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .select("-__v")
    .lean();

  return res.status(200).json({ data: docs });
};

// ── Delete document ───────────────────────────────────────────────

/**
 * DELETE /api/maester/docs/:docId
 * Removes the document record (FAISS index cleanup is handled by Python on restart; MVP).
 */
export const deleteDoc = async (req, res) => {
  const { docId } = req.params;

  const doc = await MaesterDoc.findOneAndDelete({ docId, userId: req.user.id });
  if (!doc) {
    return res.status(404).json({ message: "Document not found or access denied." });
  }

  return res.status(200).json({ message: "Document removed." });
};
