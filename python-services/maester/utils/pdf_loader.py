"""
pdf_loader.py
PDF loading using PyMuPDF (fitz).

Returns a list of LangChain Document objects — each document is one page,
carrying metadata: {source, page}.
"""
from __future__ import annotations
import fitz
from langchain_core.documents import Document


class PDFLoader:
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path

    def load(self):
        documents = []
        pdf = fitz.open(self.pdf_path)

        for page_num, page in enumerate(pdf, start=1):
            text = page.get_text("text")
            if text.strip():
                documents.append(
                    Document(
                        page_content=text,
                        metadata={
                            "source": self.pdf_path,
                            "page": page_num,
                        },
                    )
                )

        pdf.close()
        return documents


def load_pdf(pdf_path: str) -> list[Document]:
    """Convenience wrapper — returns a list of Document objects."""
    return PDFLoader(pdf_path).load()
