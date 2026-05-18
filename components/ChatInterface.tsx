"use client";

import { useEffect, useRef, useState } from "react";

interface UIMessage {
  role: "user" | "assistant";
  content: string;
  sources?: { docName: string; score: number }[];
  handoff?: boolean;
  ticketId?: string;
}

const STORAGE_KEY = "ai_support_conversation_id";

export default function ChatInterface() {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setConversationId(stored);
      fetch(`/api/chat?conversationId=${stored}`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.conversation?.messages) {
            const ui: UIMessage[] = data.conversation.messages.map((m: { role: string; content: string; sources?: { docName: string; score: number }[] }) => ({
              role: m.role === "user" ? "user" : "assistant",
              content: m.content,
              sources: m.sources,
            }));
            setMessages(ui);
          }
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, conversationId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.conversationId && data.conversationId !== conversationId) {
        setConversationId(data.conversationId);
        localStorage.setItem(STORAGE_KEY, data.conversationId);
      }
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.reply,
          sources: data.sources,
          handoff: data.handoff,
          ticketId: data.ticketId,
        },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setMessages((m) => [...m, { role: "assistant", content: `Error: ${msg}` }]);
    } finally {
      setLoading(false);
    }
  }

  function newChat() {
    localStorage.removeItem(STORAGE_KEY);
    setConversationId(null);
    setMessages([]);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)] rounded-xl border border-white/10 bg-white/[0.02]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <div className="text-sm text-white/60">
          {conversationId ? `Conversation: ${conversationId.slice(0, 8)}…` : "New conversation"}
        </div>
        <button
          onClick={newChat}
          className="text-xs px-2 py-1 rounded-md bg-white/10 hover:bg-white/20"
        >
          New chat
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-white/40 text-sm mt-12">
            Ask a question to get started. The AI uses your uploaded docs to answer.
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-emerald-500/20 border border-emerald-400/30"
                  : "bg-white/5 border border-white/10"
              }`}
            >
              <div>{m.content}</div>
              {m.handoff && (
                <div className="mt-2 text-xs text-amber-300">
                  ⚠ Handoff triggered{m.ticketId ? ` · ticket ${m.ticketId.slice(0, 8)}` : ""}
                </div>
              )}
              {m.sources && m.sources.length > 0 && (
                <div className="mt-2 text-xs text-white/40 border-t border-white/10 pt-2">
                  Sources: {m.sources.map((s) => `${s.docName} (${s.score.toFixed(2)})`).join(", ")}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-sm text-white/60">
              Thinking…
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-white/10 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Type your question…"
          className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400/50"
          disabled={loading}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-medium text-sm disabled:opacity-40"
        >
          Send
        </button>
      </div>
    </div>
  );
}
