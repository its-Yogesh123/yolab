# Maester – RAG based PDF Chat Bot (Python Core & Dual‑Server Architecture)

## Goal
Create a new service **Maester** that enables users to upload PDFs and chat with the extracted content using Retrieval‑Augmented Generation (RAG). The core processing (PDF extraction, embedding, and optional image‑processing) will be implemented in **Python**, while a **Node.js** server will serve the main web UI and orchestrate requests. Two servers will run concurrently:
1. **Main Node server** – Handles static assets, authentication, and routes that do not require heavy Python processing.
2. **Python service server** – Exposes REST endpoints for PDF text extraction, image‑processing, embedding generation, and vector‑store operations.

---

## Minimal Viable Plan (MVP)

### 1. Architecture Overview
- **Frontend** (React + Vite) – Upload UI, chat interface, simple 5‑star feedback widget.
- **Node.js Backend** (Express) – API gateway, session management, user auth, forwards PDF‑related requests to Python service.
- **Python Service** (FastAPI) – Handles PDF parsing, optional image‑processing (e.g., OCR), chunking, embedding via HuggingFace or OpenAI, and interacts with the vector store.
- **Vector Store** – Open‑source DB (Qdrant or FAISS) accessible from Python.
- **LLM** – Hosted LLM endpoint (OpenAI `gpt‑4o-mini` / Anthropic). Calls can be made from Python or Node; we will use Python for simplicity.
- **Storage** – Original PDFs stored on disk (or GridFS) and metadata in MongoDB.

### 2. Core Features
| Feature | Description | Implementation Steps |
|---|---|---|
| **PDF Upload (Node)** | Drag‑&‑drop UI, forwards file to Python service. | • `/api/maester/upload` endpoint in Node forwards multipart file to Python `/upload`.
• Python saves file temporarily and returns `docId`. |
| **Text Extraction (Python)** | Use `pdfminer.six` or `pymupdf` to extract raw text. | • Python `/extract` reads saved PDF, extracts text, splits into overlapping chunks (≈500 tokens, 100‑token overlap). |
| **Image‑Processing (Python)** | Future OCR support – placeholder for `pytesseract` integration. | • Detect if PDF pages contain images; optionally run OCR on them.
• Store extracted image text alongside normal text chunks. |
| **Embedding & Indexing (Python)** | Convert each chunk to an embedding and upsert into vector store. | • Use `sentence‑transformers` or OpenAI embeddings API.
• Store metadata (`docId`, `chunkIdx`, `text`). |
| **Chat Interface (Node → Python)** | Frontend sends query; Node forwards to Python `/query`. | • Python retrieves top‑k relevant chunks from vector store, builds prompt, calls LLM, streams answer back to Node → frontend. |
| **Feedback Widget** | Small 5‑star UI after each answer. | • Store `{sessionId, query, rating}` in MongoDB via Node endpoint `/feedback`. |
| **Session Management** | Keep conversation history per user (MongoDB). | • Node maintains session IDs, forwards them to Python for context lookup. |

### 3. Data Flow (MVP)
1. User uploads PDF via UI → Node `/upload` forwards to Python `POST /upload`.
2. Python saves PDF, runs text extraction (and image processing placeholder) → chunkifies → generates embeddings → stores in vector DB.
3. User sends chat query → Node `/query` forwards to Python `POST /query`.
4. Python retrieves top‑k chunks, constructs prompt, calls LLM, returns answer.
5. Node streams answer to frontend; feedback widget sends rating to Node `/feedback` → stored in MongoDB.

### 4. Evaluation Metrics (MVP)
- **Retrieval Precision@k** – Manual spot‑check of top‑k chunks relevance.
- **Answer Quality** – Average 1‑5 star rating from feedback widget.
- **Latency** – < 2 s for retrieval, < 5 s for generation (including Python‑Node round‑trip).

### 5. Minimal Tech Stack
- **Frontend**: React 19, Vite 5, TailwindCSS, shadcn/ui, `react-icons`.
- **Node Server**: Node 20, Express, `multer` for file forwarding, JWT auth.
- **Python Service**: Python 3.11, FastAPI, `uvicorn`, `pdfminer.six` / `pymupdf`, `sentence‑transformers`, `qdrant-client`.
- **Database**: MongoDB (metadata, feedback), optional GridFS for PDFs.
- **Vector Store**: Qdrant (run as Docker container) – accessed from Python.
- **LLM Provider**: OpenAI or Anthropic (configured via env variables).

### 6. Project Structure
```
backend/                     # Node.js server
  modules/
    maester/
      upload.controller.js   # forwards to Python
      query.controller.js    # forwards to Python
      feedback.controller.js
      auth.middleware.js
frontend/src/
  maester/
    ChatPage.jsx
    UploadDropzone.jsx
    FeedbackStar.jsx
python_service/              # FastAPI service
  main.py
  routers/
    upload.py               # /upload endpoint
    extract.py              # PDF text / image extraction
    query.py                # RAG query handling
    feedback.py             # optional endpoint (or use Node)
  utils/
    pdf_parser.py
    embedding.py
    vector_store.py
    ocr.py   # placeholder for OCR integration
```

### 7. Timeline (MVP)
| Week | Milestone |
|------|-----------|
| 1 | Scaffold Node API gateway and FastAPI skeleton; set up Docker compose for both services. |
| 2 | Implement PDF upload forwarding, Python PDF text extraction, chunking, embeddings, and vector‑store upsert. |
| 3 | Build chat query flow: retrieve chunks, call LLM, stream answer back through Node. |
| 4 | Add 5‑star feedback widget, persist ratings, basic admin dashboard for average rating. |
| 5 | End‑to‑end testing, performance tuning, write README & deployment docs. |

---

## Future‑Vision Plan (Beyond MVP)
| Area | Enhancements |
|------|--------------|
| **Full OCR Support** | Integrate `pytesseract` or a cloud OCR API to extract text from scanned PDF pages. |
| **Hybrid Retrieval** | Combine dense embeddings with BM25 (via `whoosh` or Elasticsearch) for better recall. |
| **Reranking** | Use a cross‑encoder (e.g., `cross‑encoder/ms‑marco‑MiniLM‑L‑6‑v2`) in Python to rerank retrieved chunks before prompting LLM. |
| **Fine‑tuned LLM** | Deploy an open‑source instruction‑tuned model (e.g., Llama‑3‑8B‑instruct) behind a local inference server for lower latency. |
| **Multi‑Modal Docs** | Process embedded images, tables, and charts using OCR + layout detection (`pdfplumber`). |
| **Advanced Feedback** | Collect short textual comments alongside the star rating, compute NPS, and feed back into training data for active learning. |
| **Caching & Summarization** | Cache embeddings for frequently accessed PDFs; generate concise summaries for very long documents. |
| **Access Controls** | Per‑user document isolation, role‑based permissions, usage quotas. |
| **Analytics Dashboard** | Visualize usage stats, average rating, most‑asked questions, and retrieval performance (Grafana + Prometheus). |
| **Scalable Deployment** | Containerize both Node and Python services (Docker Compose → Kubernetes), enable autoscaling of the vector store and LLM workers. |
| **Evaluation Suite** | Automated benchmark dataset (e.g., PDF‑QA SQuAD style) to compute BLEU/ROUGE alongside user ratings. |

---

## Acceptance Checklist (MVP)
- [ ] Node upload endpoint forwards PDFs to Python service.
- [ ] Python extracts plain‑text from PDFs (no OCR yet) and stores chunk embeddings.
- [ ] Vector store reachable from Python; retrieval returns top‑k chunks.
- [ ] Chat endpoint returns LLM answer via Node → frontend.
- [ ] 5‑star feedback widget records rating in MongoDB.
- [ ] Basic admin view shows average rating per document.
- [ ] Documentation (`README.md`) includes setup for both Node and Python servers.

---

*Prepared by Antigravity – your AI coding assistant.*
