# AI Customer Support Agent

RAG-powered customer support assistant with PDF knowledge base, conversation memory, and automatic human handoff.

## Stack
- **Next.js 14** (App Router, TypeScript)
- **MongoDB Atlas** — primary database (docs, conversations, tickets)
- **Vector store** — switchable: **MongoDB Atlas Vector Search** OR **Pinecone**
- **Groq SDK** — LLM inference (`llama-3.3-70b-versatile`)
- **@xenova/transformers** — local embeddings (`all-MiniLM-L6-v2`, 384 dims)
- **pdf-parse** — PDF text extraction
- **Tailwind CSS**

## Features
- Upload PDF/TXT/MD documents → chunked, embedded, stored in vector DB
- Chat answers grounded in your knowledge base (RAG)
- Conversation memory persisted in MongoDB
- Auto-ticket creation when AI lacks context or user asks for a human
- Admin panel: manage docs + tickets
- **Pluggable vector store** — switch between MongoDB and Pinecone via one env var

---

## Setup

### 1. Install dependencies
```powershell
npm install
```

### 2. Configure environment
Copy `.env.example` to `.env.local` and fill in your values:

```env
# Required
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?appName=Cluster0
MONGODB_DB=ai_support
GROQ_API_KEY=gsk_your_new_key
GROQ_MODEL=llama-3.3-70b-versatile
RAG_CONFIDENCE_THRESHOLD=0.55

# Vector store: "mongodb" (default) or "pinecone"
VECTOR_DB=mongodb

# Only needed if VECTOR_DB=pinecone
PINECONE_API_KEY=pcsk_your_key_here
PINECONE_INDEX_NAME=ai-support
```

---

### 3a. Vector store setup — Option A: MongoDB Atlas Vector Search

In **MongoDB Atlas → your cluster → Atlas Search → Create Search Index**:

1. Pick **Atlas Vector Search → JSON Editor**
2. Database: `ai_support`, Collection: `chunks`, Index name: **`vector_index`**
3. Paste this JSON:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 384,
      "similarity": "cosine"
    }
  ]
}
```

4. **Next → Create Search Index**. Wait ~1-2 minutes for "Active" status.

> The app falls back to in-memory cosine search if the index is missing — works for testing, slow for production.

---

### 3b. Vector store setup — Option B: Pinecone

In **Pinecone Console → Indexes → Create Index**:

| Field | Value |
|---|---|
| Index name | `ai-support` *(or anything — match `PINECONE_INDEX_NAME`)* |
| **Dimensions** | **`384`** *(MUST match — Xenova all-MiniLM-L6-v2)* |
| **Metric** | **`cosine`** |
| Type | Serverless |
| Cloud / region | Whatever the free tier allows (e.g. AWS `us-east-1`) |

Click **Create Index**. Wait ~1 min.

Then in `.env.local`:
```env
VECTOR_DB=pinecone
PINECONE_API_KEY=pcsk_...
PINECONE_INDEX_NAME=ai-support
```

> ⚠️ **Dimensions must be exactly 384** — if you pick another value the upload will fail with a dimension-mismatch error.

---

### 4. Run it
```powershell
npm run dev
```
Open http://localhost:3000

### 5. Use it
1. Visit `/admin` → upload a PDF (e.g. your company FAQ)
2. Visit `/chat` → ask questions about it
3. Type "I want to talk to a human" → ticket is auto-created
4. Back in `/admin` → manage ticket statuses

---

## How RAG works here (learning notes)

1. **Upload** → PDF is extracted to plain text via `pdf-parse`
2. **Chunk** → Text is split into ~800-char overlapping chunks ([lib/chunker.ts](lib/chunker.ts))
3. **Embed** → Each chunk is embedded to a 384-dim vector with `all-MiniLM-L6-v2` ([lib/embeddings.ts](lib/embeddings.ts))
4. **Store** → Chunks + embeddings stored in your chosen vector DB ([lib/vectorStore.ts](lib/vectorStore.ts))
5. **Query** → User question is embedded the same way
6. **Search** → Top-5 most similar chunks retrieved (via `$vectorSearch` or Pinecone query)
7. **Generate** → Top chunks injected as context into the Groq prompt ([app/api/chat/route.ts](app/api/chat/route.ts))
8. **Memory** → Last 6 messages of the conversation are also passed to Groq for continuity
9. **Handoff** → If LLM replies "don't have enough information" or user asks for a human, a ticket is auto-created

### Why switch vector stores?
Same RAG pipeline, different storage backend. Compare cost, speed, and features without rewriting your app. Both stores satisfy the same `VectorStore` interface in `lib/vectorStore.ts`.

---

## Deploying to Vercel

1. Push to GitHub
2. Import the repo on Vercel
3. Add the same env vars in **Vercel → Project Settings → Environment Variables**
4. In MongoDB Atlas → **Network Access** → allow `0.0.0.0/0` (or Vercel's IP range)
5. Deploy

> Cold starts will take ~3-5s on the first request because Xenova downloads the model. If this matters, swap embeddings to OpenAI or Hugging Face Inference API.

---

## Project structure

```
app/
  api/
    chat/route.ts        — POST: RAG chat; GET: load conversation
    upload/route.ts      — POST: upload doc; GET: list; DELETE: remove
    tickets/route.ts     — GET: list; PATCH: update status
  chat/page.tsx          — chat UI
  admin/page.tsx         — docs + tickets admin
  page.tsx               — landing
lib/
  mongodb.ts             — connection pool
  embeddings.ts          — Xenova local embeddings
  groq.ts                — Groq SDK client
  chunker.ts             — text splitter
  vectorStore.ts         — pluggable: MongoDB OR Pinecone
  types.ts               — TypeScript types
components/
  ChatInterface.tsx
  FileUploader.tsx
  TicketList.tsx
```
