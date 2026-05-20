import { redirect } from "next/navigation";
import FileUploader from "@/components/FileUploader";
import TicketList from "@/components/TicketList";
import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { UploadedDoc } from "@/lib/types";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

async function fetchDocs() {
  try {
    const db = await getDb();
    const docs = await db
      .collection<UploadedDoc>(COLLECTIONS.documents)
      .find({}, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
    return docs.map((d) => ({
      docId: d.docId,
      name: d.name,
      chunkCount: d.chunkCount,
      sizeBytes: d.sizeBytes,
      createdAt: d.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

export default async function AdminPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    redirect("/login?callbackUrl=/admin");
  }

  const docs = await fetchDocs();
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <div>
        <p className="text-amber-500 text-sm tracking-[0.25em] uppercase">
          Internal
        </p>
        <h1 className="text-2xl font-semibold mt-1">Admin Dashboard</h1>
        <p className="text-sm text-stone-500 mt-1">
          Manage the knowledge base and customer support tickets.
        </p>
      </div>
      <FileUploader initial={docs} />
      <TicketList />
    </div>
  );
}
