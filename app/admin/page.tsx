import { redirect } from "next/navigation";
import FileUploader from "@/components/FileUploader";
import TicketList from "@/components/TicketList";
import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { UploadedDoc, Ticket } from "@/lib/types";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

async function fetchDashboard() {
  try {
    const db = await getDb();
    const [docsRaw, chunkCount, tickets, convoCount] = await Promise.all([
      db
        .collection<UploadedDoc>(COLLECTIONS.documents)
        .find({}, { projection: { _id: 0 } })
        .sort({ createdAt: -1 })
        .toArray(),
      db.collection(COLLECTIONS.chunks).countDocuments(),
      db
        .collection<Ticket>(COLLECTIONS.tickets)
        .find({}, { projection: { status: 1 } })
        .toArray(),
      db.collection(COLLECTIONS.conversations).countDocuments(),
    ]);

    const docs = docsRaw.map((d) => ({
      docId: d.docId,
      name: d.name,
      chunkCount: d.chunkCount,
      sizeBytes: d.sizeBytes,
      createdAt: d.createdAt.toISOString(),
    }));

    return {
      docs,
      stats: {
        documents: docs.length,
        chunks: chunkCount,
        tickets: tickets.length,
        openTickets: tickets.filter((t) => t.status === "open").length,
        conversations: convoCount,
      },
    };
  } catch {
    return {
      docs: [],
      stats: { documents: 0, chunks: 0, tickets: 0, openTickets: 0, conversations: 0 },
    };
  }
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        accent
          ? "border-amber-500/30 bg-amber-500/5"
          : "border-white/10 bg-white/[0.02]"
      }`}
    >
      <div className={`text-2xl font-bold ${accent ? "text-amber-400" : "text-stone-100"}`}>
        {value}
      </div>
      <div className="text-xs text-stone-500 mt-1">{label}</div>
    </div>
  );
}

export default async function AdminPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    redirect("/login?callbackUrl=/admin");
  }

  const { docs, stats } = await fetchDashboard();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <div>
        <p className="text-amber-500 text-sm tracking-[0.25em] uppercase">
          Internal · Admin
        </p>
        <h1 className="text-3xl font-bold tracking-tight mt-1">Dashboard</h1>
        <p className="text-sm text-stone-500 mt-1">
          Manage your AI knowledge base and customer support tickets.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Documents" value={stats.documents} />
        <StatCard label="Knowledge chunks" value={stats.chunks} />
        <StatCard label="Conversations" value={stats.conversations} />
        <StatCard label="Total tickets" value={stats.tickets} />
        <StatCard label="Open tickets" value={stats.openTickets} accent />
      </div>

      {/* Knowledge base */}
      <section>
        <h2 className="text-lg font-semibold mb-1">📚 Knowledge Base</h2>
        <p className="text-sm text-stone-500 mb-3">
          Upload your FAQ or company documents (PDF, TXT, MD). The AI answers
          customer questions using these files.
        </p>
        <FileUploader initial={docs} />
      </section>

      {/* Tickets */}
      <section>
        <h2 className="text-lg font-semibold mb-1">🎫 Support Tickets</h2>
        <p className="text-sm text-stone-500 mb-3">
          Tickets created when the AI escalates or a customer asks for a human.
        </p>
        <TicketList />
      </section>
    </div>
  );
}
