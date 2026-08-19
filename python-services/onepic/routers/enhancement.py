"""
OnePic — Enhancement Router

Endpoints (all accept multipart/form-data):

  POST /enhancement/gaussian         — Gaussian Blur
  POST /enhancement/median           — Median Filter
  POST /enhancement/sharpen          — Sharpening
  POST /enhancement/histogram-eq     — Histogram Equalization
"""

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import Response

from onepic.services.image_enhancement import (
    apply_gaussian_blur,
    apply_histogram_equalization,
    apply_median_filter,
    apply_sharpening,
)

router = APIRouter(prefix="/enhancement", tags=["Enhancement"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff"}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB


async def _read_and_validate(file: UploadFile) -> bytes:
    """Read the uploaded file and perform basic validation."""
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported media type: {file.content_type}. "
                   f"Allowed: {', '.join(ALLOWED_TYPES)}",
        )
    data = await file.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File too large. Maximum allowed size is 20 MB.",
        )
    if len(data) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    return data


# ──────────────────────────────────────────────
#  Gaussian Blur
# ──────────────────────────────────────────────
@router.post("/gaussian", summary="Apply Gaussian Blur")
async def gaussian_blur(
    file: UploadFile = File(..., description="Input image"),
    radius: float = Form(2.0, ge=0.1, le=30.0, description="Blur radius (sigma)"),
):
    """
    Apply Gaussian blur to the uploaded image.

    - **radius**: Controls the strength of the blur (0.1 – 30). Default 2.0.
    """
    data = await _read_and_validate(file)
    try:
        result = apply_gaussian_blur(data, radius=radius)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Processing failed: {exc}")
    return Response(content=result, media_type="image/jpeg")


# ──────────────────────────────────────────────
#  Median Filter
# ──────────────────────────────────────────────
@router.post("/median", summary="Apply Median Filter")
async def median_filter(
    file: UploadFile = File(..., description="Input image"),
    size: int = Form(3, ge=3, le=21, description="Kernel size (odd integer, 3–21)"),
):
    """
    Apply median filter to reduce noise while preserving edges.

    - **size**: Kernel size (must be an odd integer, 3–21). Default 3.
    """
    data = await _read_and_validate(file)
    try:
        result = apply_median_filter(data, size=size)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Processing failed: {exc}")
    return Response(content=result, media_type="image/jpeg")


# ──────────────────────────────────────────────
#  Sharpening
# ──────────────────────────────────────────────
@router.post("/sharpen", summary="Sharpen Image")
async def sharpen(
    file: UploadFile = File(..., description="Input image"),
    factor: float = Form(2.0, ge=0.0, le=10.0, description="Sharpness factor (0–10)"),
):
    """
    Sharpen the uploaded image.

    - **factor**: Sharpness multiplier (0 = blurry, 1 = original, >1 = sharper). Default 2.0.
    """
    data = await _read_and_validate(file)
    try:
        result = apply_sharpening(data, factor=factor)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Processing failed: {exc}")
    return Response(content=result, media_type="image/jpeg")


# ──────────────────────────────────────────────
#  Histogram Equalization
# ──────────────────────────────────────────────
@router.post("/histogram-eq", summary="Histogram Equalization")
async def histogram_equalization(
    file: UploadFile = File(..., description="Input image"),
):
    """
    Apply histogram equalization to enhance image contrast.

    Operates on the luminance channel only to preserve original color hues.
    """
    data = await _read_and_validate(file)
    try:
        result = apply_histogram_equalization(data)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Processing failed: {exc}")
    return Response(content=result, media_type="image/jpeg")
