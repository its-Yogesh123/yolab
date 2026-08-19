"""
OnePic — Edge Detection Service (Phase 2)

Operations:
  - Sobel
  - Prewitt
  - Laplacian
  - Canny
"""

import io
import numpy as np
from PIL import Image


def _load_gray(file_bytes: bytes) -> np.ndarray:
    """Load image as grayscale NumPy array (uint8)."""
    img = Image.open(io.BytesIO(file_bytes)).convert("L")
    return np.array(img, dtype=np.float64)


def _to_bytes(arr: np.ndarray) -> bytes:
    """Convert a 2D float array to a grayscale JPEG bytes."""
    arr = np.clip(arr, 0, 255).astype(np.uint8)
    img = Image.fromarray(arr, mode="L").convert("RGB")
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=95)
    buf.seek(0)
    return buf.read()


def _convolve2d(image: np.ndarray, kernel: np.ndarray) -> np.ndarray:
    """Manual 2-D convolution (no scipy dependency)."""
    kh, kw = kernel.shape
    ph, pw = kh // 2, kw // 2
    padded = np.pad(image, ((ph, ph), (pw, pw)), mode="edge")
    out = np.zeros_like(image)
    for i in range(kh):
        for j in range(kw):
            out += kernel[i, j] * padded[i: i + image.shape[0], j: j + image.shape[1]]
    return out


# ──────────────────────────────────────────────
#  Sobel Edge Detection
# ──────────────────────────────────────────────
_SOBEL_X = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], dtype=np.float64)
_SOBEL_Y = np.array([[-1, -2, -1], [0, 0, 0], [1, 2, 1]], dtype=np.float64)


def apply_sobel(file_bytes: bytes, normalize: bool = True) -> bytes:
    """
    Sobel edge detection — highlights intensity gradients.
    Magnitude = sqrt(Gx² + Gy²), optionally normalized to [0, 255].
    """
    gray = _load_gray(file_bytes)
    gx = _convolve2d(gray, _SOBEL_X)
    gy = _convolve2d(gray, _SOBEL_Y)
    magnitude = np.sqrt(gx ** 2 + gy ** 2)
    if normalize:
        m = magnitude.max()
        if m > 0:
            magnitude = magnitude / m * 255
    return _to_bytes(magnitude)


# ──────────────────────────────────────────────
#  Prewitt Edge Detection
# ──────────────────────────────────────────────
_PREWITT_X = np.array([[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]], dtype=np.float64)
_PREWITT_Y = np.array([[-1, -1, -1], [0, 0, 0], [1, 1, 1]], dtype=np.float64)


def apply_prewitt(file_bytes: bytes) -> bytes:
    """
    Prewitt edge detection — similar to Sobel but with equal weighting
    across the kernel.  Magnitude = sqrt(Gx² + Gy²), normalized to [0, 255].
    """
    gray = _load_gray(file_bytes)
    gx = _convolve2d(gray, _PREWITT_X)
    gy = _convolve2d(gray, _PREWITT_Y)
    magnitude = np.sqrt(gx ** 2 + gy ** 2)
    m = magnitude.max()
    if m > 0:
        magnitude = magnitude / m * 255
    return _to_bytes(magnitude)


# ──────────────────────────────────────────────
#  Laplacian Edge Detection
# ──────────────────────────────────────────────
_LAPLACIAN_4 = np.array([[0, 1, 0], [1, -4, 1], [0, 1, 0]], dtype=np.float64)
_LAPLACIAN_8 = np.array([[1, 1, 1], [1, -8, 1], [1, 1, 1]], dtype=np.float64)


def apply_laplacian(file_bytes: bytes, connectivity: int = 8) -> bytes:
    """
    Laplacian (second-derivative) edge detection.

    Args:
        file_bytes:   Raw image bytes.
        connectivity: 4 or 8 (default 8). Controls kernel — 8-connectivity
                      detects diagonal edges as well.
    """
    kernel = _LAPLACIAN_8 if connectivity == 8 else _LAPLACIAN_4
    gray = _load_gray(file_bytes)
    lap = _convolve2d(gray, kernel)
    lap = np.abs(lap)
    m = lap.max()
    if m > 0:
        lap = lap / m * 255
    return _to_bytes(lap)


# ──────────────────────────────────────────────
#  Canny Edge Detection
# ──────────────────────────────────────────────
def _gaussian_kernel(size: int, sigma: float) -> np.ndarray:
    ax = np.arange(-(size // 2), size // 2 + 1, dtype=np.float64)
    xx, yy = np.meshgrid(ax, ax)
    k = np.exp(-(xx ** 2 + yy ** 2) / (2 * sigma ** 2))
    return k / k.sum()


def _non_max_suppression(magnitude: np.ndarray, angle: np.ndarray) -> np.ndarray:
    rows, cols = magnitude.shape
    result = np.zeros_like(magnitude)
    angle = angle % 180  # map to [0, 180)

    for r in range(1, rows - 1):
        for c in range(1, cols - 1):
            a = angle[r, c]
            if (0 <= a < 22.5) or (157.5 <= a < 180):
                n1, n2 = magnitude[r, c - 1], magnitude[r, c + 1]
            elif 22.5 <= a < 67.5:
                n1, n2 = magnitude[r - 1, c + 1], magnitude[r + 1, c - 1]
            elif 67.5 <= a < 112.5:
                n1, n2 = magnitude[r - 1, c], magnitude[r + 1, c]
            else:
                n1, n2 = magnitude[r - 1, c - 1], magnitude[r + 1, c + 1]

            if magnitude[r, c] >= n1 and magnitude[r, c] >= n2:
                result[r, c] = magnitude[r, c]
    return result


def _double_threshold(img: np.ndarray, low_ratio: float, high_ratio: float):
    hi = img.max() * high_ratio
    lo = hi * low_ratio
    strong = (img >= hi)
    weak = (img >= lo) & ~strong
    return strong.astype(np.float64) * 255, weak.astype(np.float64) * 128


def _hysteresis(strong: np.ndarray, weak: np.ndarray) -> np.ndarray:
    out = strong.copy()
    rows, cols = strong.shape
    for r in range(1, rows - 1):
        for c in range(1, cols - 1):
            if weak[r, c]:
                if strong[r - 1:r + 2, c - 1:c + 2].any():
                    out[r, c] = 255
    return out


def apply_canny(
    file_bytes: bytes,
    sigma: float = 1.4,
    low_threshold: float = 0.05,
    high_threshold: float = 0.15,
) -> bytes:
    """
    Canny edge detector — multi-stage algorithm for clean, thin edges.

    Steps: Gaussian smoothing → gradient magnitude/angle →
           Non-maximum suppression → Double threshold → Hysteresis tracking.

    Args:
        file_bytes:      Raw image bytes.
        sigma:           Gaussian blur sigma before edge detection (0.5 – 5).
        low_threshold:   Low ratio for double-threshold (0.01 – 0.5).
        high_threshold:  High ratio for double-threshold (0.05 – 0.9).
    """
    sigma = max(0.5, min(sigma, 5.0))
    low_threshold = max(0.01, min(low_threshold, 0.5))
    high_threshold = max(0.05, min(high_threshold, 0.9))

    gray = _load_gray(file_bytes)

    # 1. Gaussian smoothing
    ksize = max(3, int(6 * sigma + 1) | 1)  # ensure odd
    g_kernel = _gaussian_kernel(ksize, sigma)
    smoothed = _convolve2d(gray, g_kernel)

    # 2. Gradient magnitude & direction via Sobel
    gx = _convolve2d(smoothed, _SOBEL_X)
    gy = _convolve2d(smoothed, _SOBEL_Y)
    magnitude = np.hypot(gx, gy)
    m = magnitude.max()
    if m > 0:
        magnitude = magnitude / m * 255
    angle_deg = np.degrees(np.arctan2(gy, gx))

    # 3. Non-maximum suppression
    nms = _non_max_suppression(magnitude, angle_deg)

    # 4. Double threshold
    strong, weak = _double_threshold(nms, low_threshold, high_threshold)

    # 5. Edge tracking by hysteresis
    edges = _hysteresis(strong, weak)
    return _to_bytes(edges)
