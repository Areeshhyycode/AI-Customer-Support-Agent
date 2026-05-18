"use client";

import { useEffect, useState } from "react";

interface Ticket {
  ticketId: string;
  conversationId: string;
  reason: string;
  summary: string;
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  open: "text-amber-300 bg-amber-500/10 border-amber-500/30",
  in_progress: "text-blue-300 bg-blue-500/10 border-blue-500/30",
  resolved: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
};

export default function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/tickets");
    const data = await res.json();
    setTickets(data.tickets || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(ticketId: string, status: Ticket["status"]) {
    await fetch("/api/tickets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId, status }),
    });
    await load();
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Support Tickets</h2>
        <button
          onClick={load}
          className="text-xs px-2 py-1 rounded-md bg-white/10 hover:bg-white/20"
        >
          Refresh
        </button>
      </div>
      {loading ? (
        <div className="text-sm text-white/40">Loading…</div>
      ) : tickets.length === 0 ? (
        <div className="text-sm text-white/40">No tickets yet.</div>
      ) : (
        <ul className="divide-y divide-white/5">
          {tickets.map((t) => (
            <li key={t.ticketId} className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{t.summary}</div>
                  <div className="text-xs text-white/40 mt-1">
                    {t.ticketId.slice(0, 8)} · reason: {t.reason} ·{" "}
                    {new Date(t.createdAt).toLocaleString()}
                  </div>
                </div>
                <select
                  value={t.status}
                  onChange={(e) => setStatus(t.ticketId, e.target.value as Ticket["status"])}
                  className={`text-xs rounded-md border px-2 py-1 bg-black/40 ${STATUS_COLORS[t.status]}`}
                >
                  <option value="open">open</option>
                  <option value="in_progress">in_progress</option>
                  <option value="resolved">resolved</option>
                </select>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
