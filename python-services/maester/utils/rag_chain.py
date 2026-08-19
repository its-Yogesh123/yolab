"""
rag_chain.py
Full RAG chain using LangChain's ConversationalRetrievalChain.

Stack:
  - Retriever  : LangChain Chroma VectorStoreRetriever
  - LLM        : langchain-openai ChatOpenAI (gpt-4o-mini by default)
  - Chain      : ConversationalRetrievalChain — handles history-aware retrieval
                 and context-stuffing prompt automatically.
"""
from __future__ import annotations
import os
from langchain_openai import ChatOpenAI
from langchain_classic.chains import conversational_retrieval
# from langchain.chains import ConversationalRetrievalChain
from langchain_core.prompts import PromptTemplate

MODEL       = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.2"))
MAX_TOKENS  = int(os.getenv("LLM_MAX_TOKENS", "800"))

# ── System-level instructions injected via the combine_docs prompt ──────────
QA_PROMPT_TEMPLATE = """You are Maester, an expert assistant that answers questions strictly based on the provided document excerpts.

Rules:
- Answer ONLY from the context below.
- If the answer is not in the context, say: "I couldn't find that in the document."
- Be concise and precise.
- Cite page numbers when possible (e.g. "(page 3)").
- Do not make up information.

Context:
{context}

Question: {question}
Answer:"""

QA_PROMPT = PromptTemplate(
    template=QA_PROMPT_TEMPLATE,
    input_variables=["context", "question"],
)


def _get_llm() -> ChatOpenAI:
    api_key = os.getenv("OPENAI_API_KEY", "")
    if not api_key or api_key.startswith("sk-replace"):
        raise ValueError("OPENAI_API_KEY is not configured in python-services/.env")
    return ChatOpenAI(
        model=MODEL,
        temperature=TEMPERATURE,
        max_tokens=MAX_TOKENS,
        api_key=api_key,
    )


def build_chain(retriever, history: list[dict] | None = None) -> conversational_retrieval:
    """
    Build a ConversationalRetrievalChain for a given retriever.

    Args:
        retriever: LangChain VectorStoreRetriever from vector_store.get_retriever().
        history:   Optional list of prior {role, content} dicts from the frontend.
                   Converted into LangChain's (human, ai) tuple format for memory.

    Returns:
        A ConversationalRetrievalChain ready to invoke with {"question": ..., "chat_history": ...}
    """
    llm = _get_llm()

    chain = conversational_retrieval.from_llm(
        llm=llm,
        retriever=retriever,
        combine_docs_chain_kwargs={"prompt": QA_PROMPT},
        return_source_documents=True,   # we use these for source refs
        verbose=False,
    )
    return chain


def run_rag(
    retriever,
    question: str,
    history: list[dict] | None = None,
) -> tuple[str, list]:
    """
    Run the full RAG pipeline: retrieve + generate.

    Args:
        retriever: LangChain Retriever.
        question:  User's question string.
        history:   Optional prior conversation as [{role, content}] dicts.

    Returns:
        (answer: str, source_documents: list[Document])
    """
    chain = build_chain(retriever)

    # Convert frontend history format [{role, content}] → LangChain [(human, ai)]
    chat_history: list[tuple[str, str]] = []
    if history:
        # Pair up alternating user/assistant turns
        msgs = history[-12:]  # last 6 turns max
        i = 0
        while i + 1 < len(msgs):
            if msgs[i]["role"] == "user" and msgs[i + 1]["role"] == "assistant":
                chat_history.append((msgs[i]["content"], msgs[i + 1]["content"]))
                i += 2
            else:
                i += 1

    result = chain.invoke({
        "question":     question,
        "chat_history": chat_history,
    })

    answer   = result.get("answer", "")
    sources  = result.get("source_documents", [])
    return answer, sources
