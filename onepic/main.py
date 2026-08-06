"""
OnePic — FastAPI Application Entry Point

Runs on port 8001 (internal only — not exposed to the internet).
The Node.js backend proxies all image processing requests here.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.enhancement import router as enhancement_router
from routers.edge_detection import router as edge_router

# ──────────────────────────────────────────────
#  App configuration
# ──────────────────────────────────────────────
app = FastAPI(
    title="OnePic",
    description=(
        "YOLAB's dedicated image processing microservice. "
        "Handles image enhancement, edge detection, and transformations. "
        "Only accessible from the YOLAB Node.js backend — not exposed to the internet."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ──────────────────────────────────────────────
#  CORS — restrict to Node.js backend only
# ──────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000"],  # Node.js backend only
    allow_credentials=False,
    allow_methods=["POST"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────────
#  Routers
# ──────────────────────────────────────────────
app.include_router(enhancement_router)
app.include_router(edge_router)


# ──────────────────────────────────────────────
#  Health check
# ──────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health():
    """Returns 200 OK when the service is running."""
    return {"status": "ok", "service": "OnePic", "version": "1.0.0", "phases": ["enhancement", "edge-detection"]}


# ──────────────────────────────────────────────
#  Dev runner (python main.py)
# ──────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
