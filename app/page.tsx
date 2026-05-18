import Link from "next/link";

export default function Home() {
  return (
    <div className="py-12">
      <h1 className="text-4xl font-bold tracking-tight">
        AI Customer Support Agent
      </h1>
      <p className="mt-3 text-white/70 max-w-2xl">
        RAG-powered support assistant. Upload your company docs, chat with the
        knowledge base, and auto-escalate to a human when needed.
      </p>

      <div className="mt-8 grid sm:grid-cols-2 gap-4 max-w-2xl">
        <Link
          href="/chat"
          className="block rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-5"
        >
          <div className="text-lg font-semibold">Start a chat →</div>
          <div className="text-sm text-white/60 mt-1">
            Ask anything. The AI answers from your knowledge base.
          </div>
        </Link>
        <Link
          href="/admin"
          className="block rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-5"
        >
          <div className="text-lg font-semibold">Admin panel →</div>
          <div className="text-sm text-white/60 mt-1">
            Upload PDFs/docs, view tickets, manage handoffs.
          </div>
        </Link>
      </div>

      <div className="mt-12 text-sm text-white/50">
        <div className="font-semibold text-white/70 mb-2">Stack</div>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-1">
          <li>• Next.js 14 (App Router)</li>
          <li>• MongoDB Atlas Vector Search</li>
          <li>• Groq (Llama 3.3 70B)</li>
          <li>• @xenova/transformers (local embeddings)</li>
          <li>• pdf-parse</li>
          <li>• Tailwind CSS</li>
        </ul>
      </div>
    </div>
  );
}
