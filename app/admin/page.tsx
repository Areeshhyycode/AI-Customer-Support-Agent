import FileUploader from "@/components/FileUploader";
import TicketList from "@/components/TicketList";
import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { UploadedDoc } from "@/lib/types";

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
  const docs = await fetchDocs();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="text-sm text-white/60 mt-1">
          Upload company docs and manage support tickets.
        </p>
      </div>
      <FileUploader initial={docs} />
      <TicketList />
    </div>
  );
}
