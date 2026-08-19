"""
embeddings.py
Singleton HuggingFace embedding model loader for Maester.
"""
import os
from langchain_huggingface import HuggingFaceEmbeddings

MODEL_NAME = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")

_embeddings: HuggingFaceEmbeddings | None = None


def get_embeddings() -> HuggingFaceEmbeddings:
    global _embeddings
    if _embeddings is None:
        print(f"[embeddings] Loading HuggingFace model: {MODEL_NAME}")
        _embeddings = HuggingFaceEmbeddings(
            model_name=MODEL_NAME,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},  # cosine similarity
        )
        print("[embeddings] Model loaded.")
    return _embeddings
