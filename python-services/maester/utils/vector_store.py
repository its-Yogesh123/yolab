"""
vector_store.py
ChromaDB vector store helpers for Maester.
"""
from __future__ import annotations
import os
from langchain_chroma import Chroma
from langchain_core.documents import Document

from maester.utils.embeddings import get_embeddings

CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./maester/data/chroma")
os.makedirs(CHROMA_PERSIST_DIR, exist_ok=True)


def _collection_name(doc_id: str) -> str:
    return doc_id


def index_document(doc_id: str, chunks: list[Document]) -> Chroma:
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=get_embeddings(),
        collection_name=_collection_name(doc_id),
        persist_directory=CHROMA_PERSIST_DIR,
    )
    return vectorstore


def get_vectorstore(doc_id: str) -> Chroma:
    if not doc_exists(doc_id):
        raise FileNotFoundError(f"No Chroma collection found for doc_id='{doc_id}'")

    return Chroma(
        collection_name=_collection_name(doc_id),
        embedding_function=get_embeddings(),
        persist_directory=CHROMA_PERSIST_DIR,
    )


def retrieve(doc_id: str, query: str, top_k: int = 5) -> list[Document]:
    vs = get_vectorstore(doc_id)
    results: list[Document] = vs.similarity_search(query, k=top_k)
    return results


def get_retriever(doc_id: str, top_k: int = 5):
    vs = get_vectorstore(doc_id)
    return vs.as_retriever(search_kwargs={"k": top_k})


def doc_exists(doc_id: str) -> bool:
    import chromadb
    db_path = os.path.join(CHROMA_PERSIST_DIR, "chroma.sqlite3")
    if not os.path.exists(db_path):
        return False
    try:
        client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
        col = client.get_collection(_collection_name(doc_id))
        return col.count() > 0
    except Exception:
        return False


def delete_doc(doc_id: str) -> bool:
    import chromadb
    try:
        client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
        client.delete_collection(_collection_name(doc_id))
        return True
    except Exception:
        return False
