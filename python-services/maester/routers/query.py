"""
POST /maester/query
Full LangChain RAG pipeline:
  1. Load the Chroma collection for doc_id as a LangChain Retriever
  2. Run ConversationalRetrievalChain (history-aware retrieval + LLM generation)
  3. Return {answer, sources}
"""
from __future__ import annotations
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from maester.utils.vector_store import get_retriever, doc_exists
from maester.utils.rag_chain    import run_rag

router = APIRouter()

TOP_K = int(os.getenv("TOP_K", 5))


# ── Pydantic models ──────────────────────────────────────────────────────────

class HistoryMessage(BaseModel):
    role:    str   # "user" | "assistant"
    content: str


class QueryRequest(BaseModel):
    doc_id:  str
    query:   str
    history: list[HistoryMessage] | None = None


class SourceRef(BaseModel):
    page:         int | None = None
    text_preview: str        # first 150 chars of chunk


class QueryResponse(BaseModel):
    answer:  str
    sources: list[SourceRef]


# ── Route ────────────────────────────────────────────────────────────────────

@router.post("/query", response_model=QueryResponse)
async def query_document(body: QueryRequest):
    """
    Answer a question about an indexed PDF using LangChain ConversationalRetrievalChain.
    """
    if not body.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    if not doc_exists(body.doc_id):
        raise HTTPException(
            status_code=404,
            detail=f"Document '{body.doc_id}' not found. Please upload the PDF first.",
        )

    # Build a LangChain Retriever from the Chroma collection
    retriever = get_retriever(body.doc_id, top_k=TOP_K)

    # Convert pydantic history list to plain dicts for run_rag
    history_dicts = (
        [{"role": m.role, "content": m.content} for m in body.history]
        if body.history else None
    )

    # Run the full RAG chain
    try:
        answer, source_docs = run_rag(retriever, body.query, history=history_dicts)
    except ValueError as e:
        # Missing / invalid OpenAI API key
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"RAG chain error: {str(e)}")

    if not answer:
        raise HTTPException(status_code=404, detail="No relevant content found in the document.")

    # Build source references from LangChain source Documents
    sources = [
        SourceRef(
            # PyMuPDF stores 1-indexed page number (our loader starts at 1)
            page=int(doc.metadata.get("page", 0)) if "page" in doc.metadata else None,
            text_preview=doc.page_content[:150] + ("…" if len(doc.page_content) > 150 else ""),
        )
        for doc in source_docs
    ]
    # Deduplicate by page number
    seen_pages: set = set()
    unique_sources: list[SourceRef] = []
    for s in sources:
        key = s.page
        if key not in seen_pages:
            seen_pages.add(key)
            unique_sources.append(s)

    return QueryResponse(answer=answer, sources=unique_sources)
