import { Router } from "express";
import multer from "multer";
import {
  gaussianBlur,
  medianFilter,
  sharpening,
  histogramEqualization,
  sobelEdge,
  prewittEdge,
  laplacianEdge,
  cannyEdge,
} from "./onepic.controller.js";

const router = Router();

/**
 * Multer — store uploads in memory (passed directly to OnePic, never saved to disk)
 * Limit: 20 MB (matches OnePic validation)
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

// ──────────────────────────────────────────────
//  Phase 1 — Image Enhancement
// ──────────────────────────────────────────────

/**
 * POST /api/image/gaussian
 * Body (multipart): file (image), radius (float, optional)
 */
router.post("/gaussian", upload.single("file"), gaussianBlur);

/**
 * POST /api/image/median
 * Body (multipart): file (image), size (int, optional)
 */
router.post("/median", upload.single("file"), medianFilter);

/**
 * POST /api/image/sharpen
 * Body (multipart): file (image), factor (float, optional)
 */
router.post("/sharpen", upload.single("file"), sharpening);

/**
 * POST /api/image/histogram-eq
 * Body (multipart): file (image)
 */
router.post("/histogram-eq", upload.single("file"), histogramEqualization);

// ──────────────────────────────────────────────
//  Phase 2 — Edge Detection
// ──────────────────────────────────────────────

/** POST /api/image/sobel */
router.post("/sobel", upload.single("file"), sobelEdge);

/** POST /api/image/prewitt */
router.post("/prewitt", upload.single("file"), prewittEdge);

/** POST /api/image/laplacian — optional body: connectivity (4|8) */
router.post("/laplacian", upload.single("file"), laplacianEdge);

/** POST /api/image/canny — optional body: sigma, low_threshold, high_threshold */
router.post("/canny", upload.single("file"), cannyEdge);

// ──────────────────────────────────────────────
//  Multer error handler
// ──────────────────────────────────────────────
router.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError || err.message?.startsWith("Unsupported")) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: "Internal server error." });
});

export default router;
