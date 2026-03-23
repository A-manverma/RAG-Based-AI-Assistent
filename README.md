# Multimodal RAG-Based AI Assistant 🚀

A production-grade, distributed microservices AI assistant featuring Retrieval-Augmented Generation (RAG), multimodal image generation, and a premium ChatGPT-like UI.

## 🏗️ Architecture

The system is built with a clear separation of concerns:
- **Frontend (React + Vite + Tailwind CSS)**: A premium, dark-mode unified interface with streaming responses, conversation history, and an expandable source attribution panel. 
- **Backend (FastAPI)**: A modular backend exposing REST APIs and Server-Sent Events (SSE) for low-latency token streaming.
- **RAG Pipeline**: 
  - **Ingestion**: Token-aware semantic chunking (512 tokens + overlap) using `tiktoken` for PDF parsing.
  - **Retrieval**: PostgreSQL with the `pgvector` extension utilizing HNSW indexing for sub-millisecond Approximate Nearest Neighbor (ANN) search.
  - **Generation**: Orchestrated dynamically bridging `gpt-4o` (OpenAI) and local `llama3` (via Ollama/LiteLLM).
- **Multimodal capabilities**: DALL-E 3 integration for on-demand image generation via a dedicated generation service.
- **Evaluation Service**: Fully integrated telemetry tracing for offline RAGAS metrics (Faithfulness, Context Precision) and BLEU score validation.

## 🚀 Getting Started Locally

### Prerequisites
- Python 3.11+
- Node.js / npm
- Docker (for pgvector)
- OpenAI API Key

### 1. Database Setup
Spin up the `pgvector` container via Docker Compose:
```bash
docker-compose up db -d
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt

# Create your .env file
cp .env.example .env

# Run FastAPI
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Swagger UI available at `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Deployment (Infrastructure as Code)
- **Vercel**: The React frontend is configured via `vercel.json` for zero-config SPA routing.
- **Render / Railway**: The `render.yaml` and `Dockerfile` provide a containerized blueprint for serverless platform deployment of the FastAPI backend.

## 📊 Analytics & Evaluation
The system features an Admin Dashboard endpoint (`GET /api/v1/eval/metrics`) that aggregates system performance, tracking real-time response latency and exact-match answer BLEU scores across stored RAG traces.
