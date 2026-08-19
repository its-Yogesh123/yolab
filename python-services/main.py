

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

# ── OnePic routers ────────────────────────────────────────────────────────────
from onepic.routers.enhancement   import router as enhancement_router
from onepic.routers.edge_detection import router as edge_router
from onepic.routers.transforms     import router as transforms_router

# ── Maester routers ───────────────────────────────────────────────────────────
from maester.routers.upload import router as maester_upload_router
from maester.routers.query  import router as maester_query_router

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="YOLAB Python Services",
    description=(
        "Unified Python microservice combining:\n"
        "- **OnePic**: Image enhancement, edge detection, and transforms.\n"
        "- **Maester**: RAG PDF chat powered by LangChain, ChromaDB, HuggingFace embeddings, and OpenAI LLM."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mount OnePic routers ──────────────────────────────────────────────────────
app.include_router(enhancement_router)          # /enhancement/*
app.include_router(edge_router)                 # /edge/*
app.include_router(transforms_router)           # /transform/*

# ── Mount Maester routers ─────────────────────────────────────────────────────
app.include_router(maester_upload_router, prefix="/maester", tags=["Maester — Upload"])
app.include_router(maester_query_router,  prefix="/maester", tags=["Maester — Query"])


# ── Root ──────────────────────────────────────────────────────────────────────
@app.get("/", tags=["Info"])
def root():
    return {
        "service": "YOLAB Python Services",
        "version": "1.0.0",
        "components": {
            "onepic":  ["enhancement", "edge-detection", "transforms"],
            "maester": ["upload", "query"],
        },
    }


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
def health():
    return {
        "status": "healthy",
        "services": ["onepic", "maester"],
    }


# ── Dev runner ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8001)),
        reload=True,
    )
