# 🤖 AI Customer Support Agent — Acme Leather Co.

A full-stack **e-commerce store with a built-in AI customer support agent**. Customers browse and shop; instead of waiting for human support, they chat with an AI that answers from the company's own knowledge base using **RAG (Retrieval Augmented Generation)**. When the AI can't help, it automatically escalates to a human and creates a support ticket.

> **Live demo:** _add your Vercel URL here_
> **Repository:** https://github.com/Areeshhyycode/AI-Customer-Support-Agent

---

## 📑 Table of Contents
1. [What This Project Does](#what-this-project-does)
2. [Tech Stack — and Why](#tech-stack--and-why)
3. [Architecture](#architecture)
4. [How RAG Works (step by step)](#how-rag-works-step-by-step)
5. [How Authentication Works](#how-authentication-works)
6. [Database Design](#database-design)
7. [Folder Structure](#folder-structure)
8. [Setup & Installation](#setup--installation)
9. [Key Concepts (Interview Prep)](#key-concepts-interview-prep)
10. [Challenges Faced & Solutions](#challenges-faced--solutions)

---

## What This Project Does

It is **two things in one app**:

1. **An e-commerce storefront** — homepage, product catalog, shop page, customer sign-up / login.
2. **An AI customer support system** — the part that demonstrates production AI engineering.

**The business problem it solves:** companies spend heavily on customer support agents who answer the same questions repeatedly (shipping, returns, pricing). This app lets the AI handle those instantly, 24/7, and only escalates the hard cases to a human — cutting support cost while keeping a human in the loop.

### Core features
- 📄 Upload company documents (PDF / TXT / MD) into a knowledge base
- 💬 AI chat that answers **only** from that knowledge base (no hallucinations)
- 🧠 Conversation memory — the AI remembers earlier messages in a chat
- 🎫 Automatic ticket creation when the AI is not confident
- 🙋 Human handoff when a customer asks for a person
- 🔐 Separate customer and admin roles with protected admin dashboard

---

## Tech Stack — and Why

### Languages
| Language | Used for |
|----------|----------|
| **TypeScript** | All application logic — typed JavaScript, catches errors at compile time |
| **TSX (React + TypeScript)** | UI components and pages |
| **CSS (via Tailwind)** | Styling |
| **JSON** | Configuration files |

### Framework & Libraries
| Technology | Role | Why this one |
|------------|------|--------------|
| **Next.js 14** (App Router) | Full-stack React framework — frontend pages **and** backend API routes in one project | Industry standard; one codebase for UI + API; deploys easily to Vercel |
| **React 18** | Building the user interface | Component-based, declarative |
| **Tailwind CSS** | Styling | Fast, consistent design without separate CSS files |
| **MongoDB (Node driver)** | Database | Flexible document database; Atlas offers built-in vector search |
| **NextAuth v5 (Auth.js)** | Authentication & sessions | Standard auth library for Next.js; handles JWT sessions, login, logout |
| **bcryptjs** | Password hashing | Never store plain passwords — bcrypt is the standard one-way hash |
| **Groq SDK** | LLM inference (the "brain") | Runs Llama 3.3 70B extremely fast (sub-second); generous free tier |
| **Hugging Face Inference API** | Text embeddings | Converts text to vectors via API — no heavy model to host |
| **@xenova/transformers** | Local embeddings (fallback) | Runs the embedding model in Node when no API token is set |
| **pdf-parse** | Extract text from PDF uploads | Simple, reliable PDF text extraction |
| **@pinecone-database/pinecone** | Optional vector database | App can switch between MongoDB and Pinecone for vector storage |

### External Services
| Service | Purpose |
|---------|---------|
| **MongoDB Atlas** | Cloud database + vector search |
| **Groq** | Large Language Model API |
| **Hugging Face** | Embedding model API |
| **Vercel** | Hosting / deployment |

---

## Architecture

The app has **four layers**:

```
┌──────────────────────────────────────────────────────────────┐
│  1. PRESENTATION LAYER  (React components + pages)             │
│     Home · Shop · Customer Support (chat) · Login/Signup       │
│     · Admin Dashboard                                          │
└───────────────────────────────┬──────────────────────────────┘
                                 │  HTTP requests
┌───────────────────────────────▼──────────────────────────────┐
│  2. API LAYER  (Next.js route handlers — /app/api/*)           │
│     /api/chat · /api/upload · /api/tickets · /api/warmup       │
│     /api/auth/* (NextAuth) · /api/auth/register                │
└───────────────────────────────┬──────────────────────────────┘
                                 │  function calls
┌───────────────────────────────▼──────────────────────────────┐
│  3. BUSINESS LOGIC LAYER  (/lib/*)                             │
│     chunker · embeddings · vectorStore · groq · mongodb        │
│     · users                                                    │
└───────────────────────────────┬──────────────────────────────┘
                                 │  network calls
┌───────────────────────────────▼──────────────────────────────┐
│  4. EXTERNAL SERVICES                                          │
│     MongoDB Atlas · Groq API · Hugging Face API                │
└────────────────────────────────────────────────────────────────┘

  Cross-cutting:  middleware.ts + auth.ts  → protects /admin routes
```

### Request flow examples

**Customer asks a question:**
```
Browser → POST /api/chat → embed question → vector search in MongoDB
        → retrieve top chunks → build prompt → Groq LLM → answer
        → save to conversations → (maybe) create ticket → response to browser
```

**Admin uploads a document:**
```
Browser → POST /api/upload → parse PDF/TXT → split into chunks
        → embed each chunk → store vectors in MongoDB → response
```

---

## How RAG Works (step by step)

RAG = **R**etrieval **A**ugmented **G**eneration. It is the technique that makes the AI answer from *your* data instead of making things up.

### Phase 1 — Ingestion (when admin uploads a document)
1. **Parse** — extract plain text from the PDF/TXT file (`lib/chunker.ts`, `pdf-parse`).
2. **Chunk** — split the text into ~1500-character overlapping pieces. (LLMs can't take a whole 50-page doc; small chunks also make retrieval precise.)
3. **Embed** — convert each chunk into a **384-number vector** that represents its *meaning* (`lib/embeddings.ts`).
4. **Store** — save chunks + their vectors in the MongoDB `chunks` collection.

### Phase 2 — Retrieval + Generation (when a customer asks something)
5. **Embed the question** — the user's question is converted to a vector the same way.
6. **Vector search** — find the chunks whose vectors are *closest* to the question's vector (cosine similarity). These are the most relevant pieces of the knowledge base. (`lib/vectorStore.ts`)
7. **Build the prompt** — the retrieved chunks are injected into the prompt as "CONTEXT", along with the last few messages for memory.
8. **Generate** — Groq's LLM writes an answer using **only** that context (`app/api/chat/route.ts`).
9. **Guardrail** — if the context doesn't contain the answer, the system prompt forces the AI to say so, which triggers a **handoff + ticket**.

> **Why RAG instead of just asking the LLM?** The LLM has no knowledge of "Acme Leather Co." If you ask it directly, it invents answers (hallucinates). RAG grounds it in real, retrieved facts.

---

## How Authentication Works

Built with **NextAuth v5** using a credentials provider.

- **Two roles:** `customer` and `admin`.
- **Customer** — signs up via `/signup`; the account is stored in MongoDB `users` (password is bcrypt-hashed). Customers can browse and use support.
- **Admin** — a single account configured through environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`). Admins get the dashboard.
- **Sessions** — after login, a **JWT** is stored in a cookie. Every request carries it.
- **Route protection** — `middleware.ts` runs before every request; it blocks `/admin` for anyone not logged in. The `/admin` page additionally checks `role === "admin"`.
- **API protection** — `/api/upload` and `/api/tickets` re-check the admin role server-side, so a customer can't call them directly.

```
Login → credentials checked (bcrypt) → JWT issued → stored in cookie
      → middleware reads cookie on every request → allows or redirects
```

---

## Database Design

MongoDB database `ai_support` with **5 collections**:

| Collection | Stores | Key fields |
|------------|--------|------------|
| `documents` | Metadata of each uploaded file | docId, name, chunkCount, createdAt |
| `chunks` | Text chunks + their embedding vectors | docId, text, embedding[384], docName |
| `conversations` | Full chat history per conversation | conversationId, messages[], handoffRequested |
| `tickets` | Support tickets | ticketId, reason, status, summary |
| `users` | Registered customer accounts | email, passwordHash, name, role |

The `chunks` collection has a **Vector Search Index** on the `embedding` field so MongoDB can do similarity search natively.

---

## Folder Structure

```
app/
  page.tsx              — e-commerce homepage
  shop/page.tsx         — product listing
  support/page.tsx      — customer support (AI chat)
  login/ · signup/      — auth pages
  admin/page.tsx        — admin dashboard (role-protected)
  api/
    chat/route.ts       — RAG chat endpoint
    upload/route.ts     — document upload + delete
    tickets/route.ts    — list / update tickets
    warmup/route.ts     — pre-loads the embedding backend
    auth/               — NextAuth handlers + register endpoint
  layout.tsx            — shared layout (navbar + footer)

components/             — React UI components
  NavBar · Footer · ProductCard · ChatInterface
  FileUploader · TicketList · LoginForm · SignupForm

lib/                    — business logic (no UI)
  mongodb.ts            — database connection
  chunker.ts            — text splitting
  embeddings.ts         — text → vectors (HF API or local)
  vectorStore.ts        — vector search (MongoDB or Pinecone)
  groq.ts               — LLM client
  users.ts              — user create / verify
  products.ts           — static product catalog
  types.ts              — shared TypeScript types

auth.ts · auth.config.ts · middleware.ts   — authentication
public/products/        — product images
sample-data/            — demo FAQ + test queries
```

---

## Setup & Installation

### 1. Install
```powershell
npm install
```

### 2. Environment variables — copy `.env.example` to `.env.local`
```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/?appName=Cluster0
MONGODB_DB=ai_support
GROQ_API_KEY=gsk_...
GROQ_MODEL=llama-3.3-70b-versatile
RAG_CONFIDENCE_THRESHOLD=0.55
VECTOR_DB=mongodb
HF_TOKEN=hf_...                       # Hugging Face token for fast embeddings
AUTH_SECRET=<random 32-byte base64>
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=admin@acmeleather.pk
ADMIN_PASSWORD_HASH=<bcrypt hash>
```

Generate the secrets:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"   # AUTH_SECRET
node -e "require('bcryptjs').hash('your-password',10).then(console.log)"       # ADMIN_PASSWORD_HASH
```

### 3. MongoDB Atlas
- Create a **Vector Search Index** named `vector_index` on `ai_support.chunks`:
  ```json
  { "fields": [ { "type": "vector", "path": "embedding", "numDimensions": 384, "similarity": "cosine" } ] }
  ```
- **Network Access** → allow `0.0.0.0/0` (required for Vercel to connect).

### 4. Run
```powershell
npm run dev      # http://localhost:3000
```

### 5. Use
1. Log in at `/login` (admin) → upload `sample-data/company-faq.txt`
2. Go to `/support` → ask questions
3. Ask "I want a human" → a ticket is created → see it in `/admin`

---

## Key Concepts (Interview Prep)

**Q: What is RAG?**
Retrieval Augmented Generation. Instead of relying on what the LLM was trained on, you *retrieve* relevant documents at query time and feed them to the model as context. The model answers from that context. It stops hallucination and lets the AI use private, up-to-date data.

**Q: What is an embedding?**
A numeric vector (here, 384 numbers) that represents the *meaning* of a piece of text. Texts with similar meaning produce vectors that are close together. This is what makes semantic search possible — "refund" and "money back" land near each other even though the words differ.

**Q: What is a vector database / vector search?**
A database that can find the *nearest* vectors to a query vector, usually by **cosine similarity**. Here, MongoDB Atlas Vector Search does this; the app can also use Pinecone.

**Q: What is chunking and why overlap?**
Splitting a long document into small pieces before embedding. Small chunks make retrieval precise. Overlap (sharing some text between consecutive chunks) prevents losing a sentence that falls on a chunk boundary.

**Q: How does conversation memory work?**
The last few messages of the conversation are sent along with the new question so the LLM has context (e.g. "how long does it take?" after "what's your return policy?").

**Q: How does the human handoff work?**
The system prompt instructs the LLM to reply with an exact phrase when it lacks context. The backend detects that phrase (or an explicit "talk to a human" request) and creates a ticket in the database.

**Q: Why Groq for the LLM?**
Groq runs open models (Llama 3.3 70B) on specialized hardware, giving sub-second responses — important for a real-time chat experience — with a free tier.

**Q: Frontend vs backend split?**
Next.js App Router does both. React components render the UI; route handlers in `app/api/*` run on the server and talk to the database and external APIs. The `lib/` folder holds pure business logic shared by the API routes.

---

## Challenges Faced & Solutions

These are real production problems solved while building this — useful to discuss in interviews.

| Challenge | Solution |
|-----------|----------|
| **Slow uploads on Vercel** — the local embedding model (~25 MB) re-downloaded on every serverless cold start | Switched embeddings to the **Hugging Face Inference API** — no model to download, uploads went from ~30 s to under 2 s |
| **MongoDB SSL handshake failure on Vercel** (`SSL alert number 80`) | MongoDB Atlas was only allowing the developer's home IP. Fixed by adding `0.0.0.0/0` to the Atlas **Network Access** list so the serverless host could connect |
| **Vector search silently returned 0 results** when the Atlas index didn't exist | Added an automatic **in-memory cosine-similarity fallback** so search still works while the index builds |
| **Third-party API endpoint changed** — Hugging Face moved its inference URL | Updated to the current `router.huggingface.co` endpoint |
| **Customers could reach the admin page** | Added **NextAuth** with role-based middleware + server-side role checks on admin pages and APIs |
| **Pluggable vector store** | Abstracted vector storage behind a single interface so the app can switch between MongoDB and Pinecone with one environment variable |

---

## License

Built as a learning / portfolio project. Free to use and learn from.
