"""
splitter.py
Text chunking using LangChain's RecursiveCharacterTextSplitter.
"""
from __future__ import annotations
import os
from langchain_text_splitters import RecursiveCharacterTextSplitter

CHUNK_SIZE    = int(os.getenv("CHUNK_SIZE",    1000))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP",  200))


def split_documents(docs: list) -> list:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=[
            "\n\n",
            "\n",
            ". ",
            " ",
            ""
        ]
    )
    chunks = splitter.split_documents(docs)
    return chunks
