"""
OnePic — Image Transforms Service (Phase 3)

Operations:
  - Convolution      (custom kernel)
  - Thresholding     (binary / adaptive)
  - Scaling          (alias for resize — explicit quality control)
  - Rotation
  - Contrast Adjustment
  - Discrete Fourier Transform (DFT) — magnitude spectrum visualisation
"""

import io
import numpy as np
from PIL import Image, ImageEnhance


# ──────────────────────────────────────────────
#  Internal helpers
# ──────────────────────────────────────────────

def _load_rgb(file_bytes: bytes) -> Image.Image:
    """Load raw bytes as an RGB PIL image."""
    return Image.open(io.BytesIO(file_bytes)).convert("RGB")


def _load_gray(file_bytes: bytes) -> np.ndarray:
    """Load raw bytes as a float64 grayscale NumPy array."""
    img = Image.open(io.BytesIO(file_bytes)).convert("L")
    return np.array(img, dtype=np.float64)


def _pil_to_bytes(img: Image.Image, fmt: str = "JPEG") -> bytes:
    buf = io.BytesIO()
    img.save(buf, format=fmt, quality=95)
    buf.seek(0)
    return buf.read()


def _arr_to_bytes(arr: np.ndarray, mode: str = "L") -> bytes:
    """Convert a NumPy array to JPEG bytes."""
    arr = np.clip(arr, 0, 255).astype(np.uint8)
    img = Image.fromarray(arr, mode=mode)
    if mode == "L":
        img = img.convert("RGB")
    return _pil_to_bytes(img)


def _convolve2d(image: np.ndarray, kernel: np.ndarray) -> np.ndarray:
    """Simple manual 2-D convolution (no scipy dependency)."""
    kh, kw = kernel.shape
    ph, pw = kh // 2, kw // 2
    padded = np.pad(image, ((ph, ph), (pw, pw)), mode="edge")
    out = np.zeros_like(image, dtype=np.float64)
    for i in range(kh):
        for j in range(kw):
            out += kernel[i, j] * padded[i: i + image.shape[0], j: j + image.shape[1]]
    return out


# ──────────────────────────────────────────────
#  Rotation
# ──────────────────────────────────────────────

def apply_rotation(file_bytes: bytes, angle: float = 90.0, expand: bool = True) -> bytes:
    """
    Rotate the image by `angle` degrees (counter-clockwise).

    Args:
        file_bytes: Raw image bytes.
        angle:      Rotation angle in degrees. Positive = counter-clockwise.
        expand:     If True, resize the output canvas so no pixels are clipped.
    """
    img = _load_rgb(file_bytes)
    rotated = img.rotate(angle, expand=expand, resample=Image.BICUBIC)
    return _pil_to_bytes(rotated)


# ──────────────────────────────────────────────
#  Flip
# ──────────────────────────────────────────────

def apply_flip(file_bytes: bytes, direction: str = "horizontal") -> bytes:
    """
    Flip the image along horizontal or vertical axis.

    Args:
        file_bytes: Raw image bytes.
        direction:  \"horizontal\" (mirror left-right) or \"vertical\" (flip top-bottom).
    """
    img = _load_rgb(file_bytes)
    if direction == "vertical":
        flipped = img.transpose(Image.FLIP_TOP_BOTTOM)
    else:
        flipped = img.transpose(Image.FLIP_LEFT_RIGHT)
    return _pil_to_bytes(flipped)


# ──────────────────────────────────────────────
#  Resize / Scaling
# ──────────────────────────────────────────────

def apply_resize(
    file_bytes: bytes,
    width: int = 800,
    height: int = 600,
    keep_aspect: bool = True,
) -> bytes:
    """
    Resize the image to the given dimensions using high-quality Lanczos resampling.

    Args:
        file_bytes:   Raw image bytes.
        width:        Target width in pixels.
        height:       Target height in pixels.
        keep_aspect:  If True, scale uniformly so the longest edge matches the
                      target; the shorter edge is computed automatically.
    """
    img = _load_rgb(file_bytes)

    if keep_aspect:
        img.thumbnail((width, height), Image.LANCZOS)
        return _pil_to_bytes(img)

    resized = img.resize((width, height), Image.LANCZOS)
    return _pil_to_bytes(resized)


# ──────────────────────────────────────────────
#  Brightness & Contrast Adjustment
# ──────────────────────────────────────────────

def apply_brightness_contrast(
    file_bytes: bytes,
    brightness: float = 1.0,
    contrast: float = 1.0,
) -> bytes:
    """
    Independently adjust brightness and contrast using PIL's ImageEnhance.

    Args:
        file_bytes:  Raw image bytes.
        brightness:  Multiplicative brightness factor (0.1 – 3.0).
                     1.0 = no change, <1 = darker, >1 = brighter.
        contrast:    Multiplicative contrast factor (0.1 – 3.0).
                     1.0 = no change, <1 = flatter, >1 = more punchy.
    """
    img = _load_rgb(file_bytes)
    img = ImageEnhance.Brightness(img).enhance(brightness)
    img = ImageEnhance.Contrast(img).enhance(contrast)
    return _pil_to_bytes(img)


# ──────────────────────────────────────────────
#  Grayscale Conversion
# ──────────────────────────────────────────────

def apply_grayscale(file_bytes: bytes) -> bytes:
    """
    Convert a colour image to grayscale using the ITU-R BT.601 luminance formula
    (0.299R + 0.587G + 0.114B). The returned image is 3-channel (RGB) for
    compatibility with downstream viewers.
    """
    img = _load_rgb(file_bytes)
    gray = img.convert("L").convert("RGB")
    return _pil_to_bytes(gray)


# ──────────────────────────────────────────────
#  Colour Inversion
# ──────────────────────────────────────────────

def apply_invert(file_bytes: bytes) -> bytes:
    """
    Produce a photographic negative by subtracting every pixel value from 255.
    Works correctly on both RGB and grayscale images.
    """
    img = _load_rgb(file_bytes)
    arr = np.array(img, dtype=np.uint8)
    inverted = 255 - arr
    return _pil_to_bytes(Image.fromarray(inverted, mode="RGB"))


# ──────────────────────────────────────────────
#  Custom Convolution
# ──────────────────────────────────────────────

def apply_convolution(file_bytes: bytes, kernel: list[list[float]]) -> bytes:
    """
    Apply an arbitrary NxN convolution kernel to the grayscale version of the image.

    Args:
        file_bytes: Raw image bytes.
        kernel:     2-D list of floats representing the kernel.
    """
    k = np.array(kernel, dtype=np.float64)
    gray = _load_gray(file_bytes)
    result = _convolve2d(gray, k)
    result = np.clip(np.abs(result), 0, 255)
    return _arr_to_bytes(result)


# ──────────────────────────────────────────────
#  Thresholding
# ──────────────────────────────────────────────

def apply_threshold(
    file_bytes: bytes,
    threshold: int = 128,
    mode: str = "binary",
) -> bytes:
    """
    Apply binary or Otsu's automatic thresholding to the image.

    Args:
        file_bytes:  Raw image bytes.
        threshold:   Pixel value cutoff (0–255) — used when mode='binary'.
        mode:        'binary' uses the fixed threshold value;
                     'otsu' computes the optimal threshold automatically.
    """
    gray = _load_gray(file_bytes)

    if mode == "otsu":
        # Otsu's method: maximise inter-class variance
        hist, _ = np.histogram(gray.astype(np.uint8), bins=256, range=(0, 256))
        hist = hist.astype(np.float64)
        total = hist.sum()
        sum_b, w_b, max_var, best_t = 0.0, 0.0, 0.0, 0
        total_mean = (np.arange(256) * hist).sum()

        for t in range(256):
            w_b += hist[t]
            if w_b == 0:
                continue
            w_f = total - w_b
            if w_f == 0:
                break
            sum_b += t * hist[t]
            mean_b = sum_b / w_b
            mean_f = (total_mean - sum_b) / w_f
            var = w_b * w_f * (mean_b - mean_f) ** 2
            if var > max_var:
                max_var, best_t = var, t
        threshold = best_t

    binary = (gray >= threshold).astype(np.uint8) * 255
    return _arr_to_bytes(binary)


# ──────────────────────────────────────────────
#  Discrete Fourier Transform (DFT)
# ──────────────────────────────────────────────

def apply_dft(file_bytes: bytes) -> bytes:
    """
    Compute the 2-D DFT of the image and return the log-magnitude spectrum
    as a visualisable grayscale image (spectrum centred, normalised to 0–255).

    Useful for analysing frequency content: bright dots = dominant frequencies,
    horizontal/vertical bright lines = strong periodic patterns.
    """
    gray = _load_gray(file_bytes)

    # 2-D DFT
    f = np.fft.fft2(gray)
    # Shift zero-frequency to centre
    fshift = np.fft.fftshift(f)
    # Log-magnitude (add 1 to avoid log(0))
    magnitude = np.log1p(np.abs(fshift))
    # Normalise to [0, 255]
    mag_min, mag_max = magnitude.min(), magnitude.max()
    if mag_max > mag_min:
        magnitude = (magnitude - mag_min) / (mag_max - mag_min) * 255
    return _arr_to_bytes(magnitude)
