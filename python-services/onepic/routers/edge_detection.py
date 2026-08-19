"""
OnePic — Edge Detection Router (Phase 2)

Endpoints:
  POST /edge/sobel
  POST /edge/prewitt
  POST /edge/laplacian
  POST /edge/canny
"""

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import Response

from onepic.services.edge_detection import (
    apply_canny,
    apply_laplacian,
    apply_prewitt,
    apply_sobel,
)

router = APIRouter(prefix="/edge", tags=["Edge Detection"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff"}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB


async def _read_and_validate(file: UploadFile) -> bytes:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported media type: {file.content_type}.",
        )
    data = await file.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Max 20 MB.")
    if len(data) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    return data


# ── Sobel ──────────────────────────────────────
@router.post("/sobel", summary="Sobel Edge Detection")
async def sobel(file: UploadFile = File(...)):
    """Detect edges using horizontal and vertical Sobel kernels."""
    data = await _read_and_validate(file)
    try:
        result = apply_sobel(data)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Processing failed: {exc}")
    return Response(content=result, media_type="image/jpeg")


# ── Prewitt ────────────────────────────────────
@router.post("/prewitt", summary="Prewitt Edge Detection")
async def prewitt(file: UploadFile = File(...)):
    """Detect edges using the Prewitt operator."""
    data = await _read_and_validate(file)
    try:
        result = apply_prewitt(data)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Processing failed: {exc}")
    return Response(content=result, media_type="image/jpeg")


# ── Laplacian ──────────────────────────────────
@router.post("/laplacian", summary="Laplacian Edge Detection")
async def laplacian(
    file: UploadFile = File(...),
    connectivity: int = Form(8, ge=4, le=8),
):
    """Detect edges using the Laplacian (second derivative) operator."""
    if connectivity not in (4, 8):
        raise HTTPException(status_code=422, detail="connectivity must be 4 or 8.")
    data = await _read_and_validate(file)
    try:
        result = apply_laplacian(data, connectivity=connectivity)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Processing failed: {exc}")
    return Response(content=result, media_type="image/jpeg")


# ── Canny ──────────────────────────────────────
@router.post("/canny", summary="Canny Edge Detection")
async def canny(
    file: UploadFile = File(...),
    sigma: float = Form(1.4, ge=0.5, le=5.0),
    low_threshold: float = Form(0.05, ge=0.01, le=0.5),
    high_threshold: float = Form(0.15, ge=0.05, le=0.9),
):
    """
    Multi-stage Canny edge detector.
    - **sigma**: Gaussian blur before detection.
    - **low_threshold / high_threshold**: Double-threshold ratios for hysteresis.
    """
    data = await _read_and_validate(file)
    try:
        result = apply_canny(data, sigma=sigma, low_threshold=low_threshold, high_threshold=high_threshold)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Processing failed: {exc}")
    return Response(content=result, media_type="image/jpeg")
