import axios from "axios";
import FormData from "form-data";

const ONEPIC_BASE = process.env.ONEPIC_URL || "http://localhost:8001";

/**
 * Generic helper — forwards the multer file buffer to an OnePic endpoint
 * and streams the binary response back to the Express res object.
 *
 * @param {string}          endpoint  - OnePic path, e.g. "/enhancement/gaussian"
 * @param {Express.Request} req       - Incoming Express request (contains file + body)
 * @param {Express.Response} res      - Express response to pipe the result into
 * @param {object}          extraFields - Additional form fields to append (e.g. { radius: 2 })
 */
async function proxyToOnePic(endpoint, req, res, extraFields = {}) {
  if (!req.file) {
    return res.status(400).json({ error: "No image file uploaded." });
  }

  const form = new FormData();
  form.append("file", req.file.buffer, {
    filename: req.file.originalname || "upload.jpg",
    contentType: req.file.mimetype,
  });

  for (const [key, value] of Object.entries(extraFields)) {
    form.append(key, String(value));
  }

  try {
    const response = await axios.post(`${ONEPIC_BASE}${endpoint}`, form, {
      headers: form.getHeaders(),
      responseType: "arraybuffer",
      timeout: 60_000, // 60 s max for large images
    });

    res.set("Content-Type", "image/jpeg");
    res.set("Content-Disposition", "inline; filename=\"processed.jpg\"");
    return res.status(200).send(Buffer.from(response.data));
  } catch (err) {
    // Forward OnePic error details when available
    if (err.response) {
      const detail = err.response.data
        ? JSON.parse(Buffer.from(err.response.data).toString()).detail
        : "OnePic processing error";
      return res.status(err.response.status).json({ error: detail });
    }
    console.error("[onepic] proxy error:", err.message);
    return res.status(503).json({ error: "Image processing service is unavailable." });
  }
}

// ──────────────────────────────────────────────
//  Controllers
// ──────────────────────────────────────────────

export const gaussianBlur = (req, res) => {
  const radius = parseFloat(req.body?.radius) || 2.0;
  return proxyToOnePic("/enhancement/gaussian", req, res, { radius });
};

export const medianFilter = (req, res) => {
  const size = parseInt(req.body?.size, 10) || 3;
  return proxyToOnePic("/enhancement/median", req, res, { size });
};

export const sharpening = (req, res) => {
  const factor = parseFloat(req.body?.factor) || 2.0;
  return proxyToOnePic("/enhancement/sharpen", req, res, { factor });
};

export const histogramEqualization = (req, res) => {
  return proxyToOnePic("/enhancement/histogram-eq", req, res);
};

// ──────────────────────────────────────────────
//  Phase 2 — Edge Detection
// ──────────────────────────────────────────────

export const sobelEdge = (req, res) => {
  return proxyToOnePic("/edge/sobel", req, res);
};

export const prewittEdge = (req, res) => {
  return proxyToOnePic("/edge/prewitt", req, res);
};

export const laplacianEdge = (req, res) => {
  const connectivity = parseInt(req.body?.connectivity, 10) || 8;
  return proxyToOnePic("/edge/laplacian", req, res, { connectivity });
};

export const cannyEdge = (req, res) => {
  const sigma = parseFloat(req.body?.sigma) || 1.4;
  const low_threshold = parseFloat(req.body?.low_threshold) || 0.05;
  const high_threshold = parseFloat(req.body?.high_threshold) || 0.15;
  return proxyToOnePic("/edge/canny", req, res, { sigma, low_threshold, high_threshold });
};

// ──────────────────────────────────────────────
//  Phase 3 — Image Transforms
// ──────────────────────────────────────────────

export const rotateImage = (req, res) => {
  const angle = parseFloat(req.body?.angle) || 90;
  const expand = req.body?.expand === 'true' || true;
  return proxyToOnePic("/transform/rotate", req, res, { angle, expand });
};

export const flipImage = (req, res) => {
  const direction = req.body?.direction || "horizontal";
  return proxyToOnePic("/transform/flip", req, res, { direction });
};

export const resizeImage = (req, res) => {
  const width  = parseInt(req.body?.width, 10)  || 800;
  const height = parseInt(req.body?.height, 10) || 600;
  const keep_aspect = req.body?.keep_aspect !== 'false';
  return proxyToOnePic("/transform/resize", req, res, { width, height, keep_aspect });
};

export const brightnessContrast = (req, res) => {
  const brightness = parseFloat(req.body?.brightness) || 1.0;
  const contrast   = parseFloat(req.body?.contrast)   || 1.0;
  return proxyToOnePic("/transform/brightness-contrast", req, res, { brightness, contrast });
};

export const grayscale = (req, res) => {
  return proxyToOnePic("/transform/grayscale", req, res);
};

export const invertColors = (req, res) => {
  return proxyToOnePic("/transform/invert", req, res);
};
