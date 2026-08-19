"""
OnePic — Image Enhancement Service
Pure image processing logic using Pillow and NumPy.

Operations:
  - Gaussian Blur
  - Median Filter
  - Sharpening
  - Histogram Equalization
"""

import io
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance


def _load_image(file_bytes: bytes) -> Image.Image:
    """Load image from raw bytes."""
    return Image.open(io.BytesIO(file_bytes)).convert("RGB")


def _to_bytes(image: Image.Image, fmt: str = "JPEG") -> bytes:
    """Serialize a PIL Image to bytes."""
    buf = io.BytesIO()
    image.save(buf, format=fmt, quality=95)
    buf.seek(0)
    return buf.read()


# ──────────────────────────────────────────────
#  Gaussian Blur
# ──────────────────────────────────────────────
def apply_gaussian_blur(file_bytes: bytes, radius: float = 2.0) -> bytes:
    """
    Apply Gaussian blur to the image.

    Args:
        file_bytes: Raw image bytes.
        radius:     Blur radius (sigma). Higher = more blur. Default 2.0.

    Returns:
        Processed image as JPEG bytes.
    """
    radius = max(0.1, min(radius, 30.0))  # clamp 0.1 – 30
    img = _load_image(file_bytes)
    blurred = img.filter(ImageFilter.GaussianBlur(radius=radius))
    return _to_bytes(blurred)


# ──────────────────────────────────────────────
#  Median Filter
# ──────────────────────────────────────────────
def apply_median_filter(file_bytes: bytes, size: int = 3) -> bytes:
    """
    Apply median filter to reduce noise.

    Args:
        file_bytes: Raw image bytes.
        size:       Kernel size (must be odd). Default 3.

    Returns:
        Processed image as JPEG bytes.
    """
    # Kernel size must be a positive odd integer
    size = max(3, size)
    if size % 2 == 0:
        size += 1

    img = _load_image(file_bytes)
    filtered = img.filter(ImageFilter.MedianFilter(size=size))
    return _to_bytes(filtered)


# ──────────────────────────────────────────────
#  Sharpening
# ──────────────────────────────────────────────
def apply_sharpening(file_bytes: bytes, factor: float = 2.0) -> bytes:
    """
    Sharpen the image using PIL's ImageEnhance.Sharpness.

    Args:
        file_bytes: Raw image bytes.
        factor:     Sharpness factor.
                    1.0 = original, >1.0 = sharper, <1.0 = blurrier.
                    Default 2.0.

    Returns:
        Processed image as JPEG bytes.
    """
    factor = max(0.0, min(factor, 10.0))  # clamp 0 – 10
    img = _load_image(file_bytes)
    enhancer = ImageEnhance.Sharpness(img)
    sharpened = enhancer.enhance(factor)
    return _to_bytes(sharpened)


# ──────────────────────────────────────────────
#  Histogram Equalization
# ──────────────────────────────────────────────
def apply_histogram_equalization(file_bytes: bytes) -> bytes:
    """
    Apply histogram equalization to improve contrast.

    The operation is applied to the Luminance (Y) channel of the YCbCr
    color space so that color hues are preserved.

    Args:
        file_bytes: Raw image bytes.

    Returns:
        Processed image as JPEG bytes.
    """
    img = _load_image(file_bytes)

    # Convert to YCbCr to equalize only the luminance channel
    img_ycbcr = img.convert("YCbCr")
    y, cb, cr = img_ycbcr.split()

    # NumPy-based histogram equalization on the Y channel
    y_np = np.array(y, dtype=np.uint8)
    hist, bins = np.histogram(y_np.flatten(), 256, [0, 256])
    cdf = hist.cumsum()
    # Mask pixels that have zero count
    cdf_min = cdf[cdf > 0].min()
    total_pixels = y_np.size
    lut = np.round(
        (cdf - cdf_min) / (total_pixels - cdf_min) * 255
    ).astype(np.uint8)

    y_eq = Image.fromarray(lut[y_np])

    # Merge back and convert to RGB
    img_eq = Image.merge("YCbCr", (y_eq, cb, cr)).convert("RGB")
    return _to_bytes(img_eq)
