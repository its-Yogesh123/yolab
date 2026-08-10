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
  rotateImage,
  flipImage,
  resizeImage,
  brightnessContrast,
  grayscale,
  invertColors,
  convolution,
  threshold,
  dft,
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
//  Phase 3 — Image Transforms
// ──────────────────────────────────────────────

/** POST /api/image/rotate — body: angle (float), expand (bool) */
router.post("/rotate", upload.single("file"), rotateImage);

/** POST /api/image/flip — body: direction ("horizontal"|"vertical") */
router.post("/flip", upload.single("file"), flipImage);

/** POST /api/image/resize — body: width (int), height (int), keep_aspect (bool) */
router.post("/resize", upload.single("file"), resizeImage);

/** POST /api/image/brightness-contrast — body: brightness (float 0–3), contrast (float 0–3) */
router.post("/brightness-contrast", upload.single("file"), brightnessContrast);

/** POST /api/image/grayscale */
router.post("/grayscale", upload.single("file"), grayscale);

/** POST /api/image/invert */
router.post("/invert", upload.single("file"), invertColors);

/** POST /api/image/convolution — body: kernel (JSON string) */
router.post("/convolution", upload.single("file"), convolution);

/** POST /api/image/threshold — body: threshold (int 0-255), mode ('binary'|'otsu') */
router.post("/threshold", upload.single("file"), threshold);

/** POST /api/image/dft — Discrete Fourier Transform magnitude spectrum */
router.post("/dft", upload.single("file"), dft);

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
