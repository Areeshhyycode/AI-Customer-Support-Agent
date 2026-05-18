"use client";

import { useState } from "react";

interface UploadedDocSummary {
  docId: string;
  name: string;
  chunkCount: number;
  sizeBytes: number;
  createdAt: string;
}

export default function FileUploader({
  initial,
  onChange,
}: {
  initial: UploadedDocSummary[];
  onChange?: (docs: UploadedDocSummary[]) => void;
}) {
  const [docs, setDocs] = useState<UploadedDocSummary[]>(initial);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch("/api/upload");
    const data = await res.json();
    setDocs(data.documents || []);
    onChange?.(data.documents || []);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(docId: string) {
    if (!confirm("Delete this document and all its chunks?")) return;
    await fetch(`/api/upload?docId=${docId}`, { method: "DELETE" });
    await refresh();
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Knowledge Base</h2>
        <label className="cursor-pointer text-sm px-3 py-1.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-black font-medium">
          {uploading ? "Uploading…" : "Upload PDF / TXT"}
          <input
            type="file"
            accept=".pdf,.txt,.md"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>
      {error && <div className="text-sm text-red-400 mb-2">{error}</div>}
      {docs.length === 0 ? (
        <div className="text-sm text-white/40">
          No documents yet. Upload a PDF or text file to populate the knowledge base.
        </div>
      ) : (
        <ul className="divide-y divide-white/5">
          {docs.map((d) => (
            <li key={d.docId} className="py-2 flex items-center justify-between text-sm">
              <div>
                <div className="font-medium">{d.name}</div>
                <div className="text-xs text-white/40">
                  {d.chunkCount} chunks · {(d.sizeBytes / 1024).toFixed(1)} KB ·{" "}
                  {new Date(d.createdAt).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => handleDelete(d.docId)}
                className="text-xs px-2 py-1 rounded-md text-red-300 hover:bg-red-500/10"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
