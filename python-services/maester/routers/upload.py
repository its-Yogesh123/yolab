"""
POST /maester/upload
Full LangChain pipeline:
  1. Save uploaded PDF to disk
  2. Load with PyMuPDFLoader (LangChain)
  3. Split with RecursiveCharacterTextSplitter (LangChain)
  4. Embed with HuggingFaceEmbeddings + store in Chroma (LangChain)
  5. Return {doc_id, pages, chunks, message}
"""
from __future__ import annotations
import os
import uuid
from fastapi import APIRouter, File, UploadFile, HTTPException

from maester.utils.pdf_loader   import load_pdf
from maester.utils.splitter     import split_documents
from maester.utils.vector_store import index_document

router = APIRouter()

PDF_DIR  = os.getenv("PDF_UPLOAD_DIR", "./maester/data/pdfs")
MAX_SIZE = 10 * 1024 * 1024  # 10 MB

os.makedirs(PDF_DIR, exist_ok=True)


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Upload a PDF, run the full LangChain ingest pipeline, and return index metadata.
    """
    # ── Validate content type ────────────────────────────────────────────────
    is_pdf_mime = file.content_type in ("application/pdf", "application/octet-stream")
    is_pdf_name = (file.filename or "").lower().endswith(".pdf")
    if not (is_pdf_mime or is_pdf_name):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    # ── Read + size check ────────────────────────────────────────────────────
    data = await file.read()
    if len(data) > MAX_SIZE:
        raise HTTPException(status_code=413, detail="File exceeds the 10 MB limit.")

    # ── Save to disk (PyMuPDF requires a file path) ──────────────────────────
    doc_id   = str(uuid.uuid4())
    pdf_path = os.path.join(PDF_DIR, f"{doc_id}.pdf")
    with open(pdf_path, "wb") as f:
        f.write(data)

    try:
        # ── 1. Load PDF ──────────────────────────────────────────────────────
        docs = load_pdf(pdf_path)
        if not docs:
            raise HTTPException(
                status_code=422,
                detail="No extractable text found. Is this a scanned PDF?",
            )

        # ── 2. Split into chunks ─────────────────────────────────────────────
        chunks = split_documents(docs)
        if not chunks:
            raise HTTPException(
                status_code=422,
                detail="Could not create text chunks from the document.",
            )

        # ── 3. Embed + store in ChromaDB ─────────────────────────────────────
        index_document(doc_id, chunks)

    except HTTPException:
        raise
    except Exception as exc:
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(exc)}")

    # Count unique pages from loaded docs
    page_count = len(set(d.metadata.get("page", i) for i, d in enumerate(docs)))

    return {
        "doc_id":  doc_id,
        "pages":   page_count,
        "chunks":  len(chunks),
        "message": "PDF indexed successfully.",
    }
