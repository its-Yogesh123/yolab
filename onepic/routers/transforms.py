"""
OnePic — Image Transforms Router (Phase 3)

Endpoints (all accept multipart/form-data):

  POST /transform/rotate              — Rotation
  POST /transform/flip                — Flip (horizontal / vertical)
  POST /transform/resize              — Resize / Scaling
  POST /transform/brightness-contrast — Brightness & Contrast
  POST /transform/grayscale           — Grayscale Conversion
  POST /transform/invert              — Colour Inversion
  POST /transform/convolution         — Custom Convolution Kernel
  POST /transform/threshold           — Binary / Otsu Thresholding
  POST /transform/dft                 — Discrete Fourier Transform spectrum
"""

import json

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import Response

from services.image_transforms import (
    apply_rotation,
    apply_flip,
    apply_resize,
    apply_brightness_contrast,
    apply_grayscale,
    apply_invert,
    apply_convolution,
    apply_threshold,
    apply_dft,
)

router = APIRouter(prefix="/transform", tags=["Transforms"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff"}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB


async def _read_and_validate(file: UploadFile) -> bytes:
    """Read the uploaded file and perform basic validation."""
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported media type: {file.content_type}. "
                   f"Allowed: {', '.join(sorted(ALLOWED_TYPES))}",
        )
    data = await file.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum allowed size is 20 MB.")
    if len(data) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    return data


# ──────────────────────────────────────────────
#  Rotation
# ──────────────────────────────────────────────

@router.post("/rotate", summary="Rotate Image")
async def rotate(
    file: UploadFile = File(..., description="Input image"),
    angle: float = Form(90.0, ge=-360.0, le=360.0, description="Rotation angle in degrees (counter-clockwise)"),
    expand: bool = Form(True, description="Expand canvas to avoid clipping"),
):
    """
    Rotate the image by `angle` degrees (counter-clockwise).

    - **angle**: -360 to 360. Positive values rotate counter-clockwise.
    - **expand**: If true, the canvas is expanded to fit the entire rotated image.
    """
    data = await _read_and_validate(file)
    try:
        result = apply_rotation(data, angle=angle, expand=expand)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Processing failed: {exc}")
    return Response(content=result, media_type="image/jpeg")


# ──────────────────────────────────────────────
#  Flip
# ──────────────────────────────────────────────

@router.post("/flip", summary="Flip Image")
async def flip(
    file: UploadFile = File(..., description="Input image"),
    direction: str = Form("horizontal", description="'horizontal' or 'vertical'"),
):
    """
    Mirror the image along the horizontal or vertical axis.

    - **direction**: `horizontal` (left-right mirror) or `vertical` (top-bottom flip).
    """
    if direction not in ("horizontal", "vertical"):
        raise HTTPException(status_code=422, detail="direction must be 'horizontal' or 'vertical'.")
    data = await _read_and_validate(file)
    try:
        result = apply_flip(data, direction=direction)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Processing failed: {exc}")
    return Response(content=result, media_type="image/jpeg")


# ──────────────────────────────────────────────
#  Resize / Scaling
# ──────────────────────────────────────────────

@router.post("/resize", summary="Resize Image")
async def resize(
    file: UploadFile = File(..., description="Input image"),
    width: int = Form(800, ge=16, le=8192, description="Target width in pixels"),
    height: int = Form(600, ge=16, le=8192, description="Target height in pixels"),
    keep_aspect: bool = Form(True, description="Maintain aspect ratio (thumbnail mode)"),
):
    """
    Resize the image to the given dimensions using Lanczos resampling.

    - **width / height**: Target dimensions in pixels (16–8192).
    - **keep_aspect**: If true, the image is scaled so the longest edge fits within
      width × height; the other edge is computed automatically to preserve proportions.
    """
    data = await _read_and_validate(file)
    try:
        result = apply_resize(data, width=width, height=height, keep_aspect=keep_aspect)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Processing failed: {exc}")
    return Response(content=result, media_type="image/jpeg")


# ──────────────────────────────────────────────
#  Brightness & Contrast
# ──────────────────────────────────────────────

@router.post("/brightness-contrast", summary="Adjust Brightness & Contrast")
async def brightness_contrast(
    file: UploadFile = File(..., description="Input image"),
    brightness: float = Form(1.0, ge=0.1, le=3.0, description="Brightness factor (1.0 = no change)"),
    contrast:   float = Form(1.0, ge=0.1, le=3.0, description="Contrast factor (1.0 = no change)"),
):
    """
    Independently adjust brightness and contrast.

    - **brightness**: 0.1 (dark) → 1.0 (original) → 3.0 (very bright).
    - **contrast**: 0.1 (flat/grey) → 1.0 (original) → 3.0 (high contrast).
    """
    data = await _read_and_validate(file)
    try:
        result = apply_brightness_contrast(data, brightness=brightness, contrast=contrast)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Processing failed: {exc}")
    return Response(content=result, media_type="image/jpeg")


# ──────────────────────────────────────────────
#  Grayscale
# ──────────────────────────────────────────────

@router.post("/grayscale", summary="Convert to Grayscale")
async def grayscale(
    file: UploadFile = File(..., description="Input image"),
):
    """
    Convert the image to grayscale using the ITU-R BT.601 luminance formula
    (0.299R + 0.587G + 0.114B). The output is a 3-channel RGB image for
    broad compatibility with viewers and downstream processing.
    """
    data = await _read_and_validate(file)
    try:
        result = apply_grayscale(data)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Processing failed: {exc}")
    return Response(content=result, media_type="image/jpeg")


# ──────────────────────────────────────────────
#  Invert
# ──────────────────────────────────────────────

@router.post("/invert", summary="Invert Colours")
async def invert(
    file: UploadFile = File(..., description="Input image"),
):
    """
    Produce a photographic negative by subtracting every pixel value from 255.
    Works on both colour and grayscale images.
    """
    data = await _read_and_validate(file)
    try:
        result = apply_invert(data)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Processing failed: {exc}")
    return Response(content=result, media_type="image/jpeg")


# ──────────────────────────────────────────────
#  Custom Convolution
# ──────────────────────────────────────────────

@router.post("/convolution", summary="Custom Convolution Kernel")
async def convolution(
    file: UploadFile = File(..., description="Input image"),
    kernel: str = Form(
        "[[0,-1,0],[-1,5,-1],[0,-1,0]]",
        description="JSON-encoded 2-D kernel array (e.g. sharpen, emboss, edge)",
    ),
):
    """
    Apply an arbitrary NxN convolution kernel to the grayscale version of the image.

    Provide the kernel as a **JSON-encoded 2-D array**. Examples:
    - Sharpen: `[[0,-1,0],[-1,5,-1],[0,-1,0]]`
    - Edge:    `[[-1,-1,-1],[-1,8,-1],[-1,-1,-1]]`
    - Emboss:  `[[-2,-1,0],[-1,1,1],[0,1,2]]`
    """
    try:
        kernel_list = json.loads(kernel)
        if not isinstance(kernel_list, list) or not all(isinstance(row, list) for row in kernel_list):
            raise ValueError
    except (ValueError, TypeError):
        raise HTTPException(status_code=422, detail="kernel must be a valid JSON 2-D array.")

    data = await _read_and_validate(file)
    try:
        result = apply_convolution(data, kernel=kernel_list)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Processing failed: {exc}")
    return Response(content=result, media_type="image/jpeg")


# ──────────────────────────────────────────────
#  Thresholding
# ──────────────────────────────────────────────

@router.post("/threshold", summary="Binary / Otsu Thresholding")
async def threshold(
    file: UploadFile = File(..., description="Input image"),
    threshold: int = Form(128, ge=0, le=255, description="Pixel cutoff value (used in binary mode)"),
    mode: str = Form("binary", description="'binary' or 'otsu'"),
):
    """
    Apply thresholding to segment the image into black-and-white regions.

    - **mode = binary**: Pixels ≥ threshold → white, else → black.
    - **mode = otsu**: Automatically computes the optimal threshold that maximises
      inter-class variance (best for bimodal histograms).
    """
    if mode not in ("binary", "otsu"):
        raise HTTPException(status_code=422, detail="mode must be 'binary' or 'otsu'.")
    data = await _read_and_validate(file)
    try:
        result = apply_threshold(data, threshold=threshold, mode=mode)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Processing failed: {exc}")
    return Response(content=result, media_type="image/jpeg")


# ──────────────────────────────────────────────
#  Discrete Fourier Transform (DFT)
# ──────────────────────────────────────────────

@router.post("/dft", summary="DFT Magnitude Spectrum")
async def dft(
    file: UploadFile = File(..., description="Input image"),
):
    """
    Compute the 2-D Discrete Fourier Transform and return the log-magnitude
    spectrum as a grayscale image (zero-frequency centred).

    - Bright dots = dominant spatial frequencies.
    - Horizontal/vertical bright lines = strong periodic patterns.
    - Useful for frequency analysis, texture inspection, and filter design.
    """
    data = await _read_and_validate(file)
    try:
        result = apply_dft(data)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Processing failed: {exc}")
    return Response(content=result, media_type="image/jpeg")
