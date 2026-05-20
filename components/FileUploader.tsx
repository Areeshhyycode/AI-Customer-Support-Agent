"use client";

import { useEffect, useRef, useState } from "react";

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
  const [warmStatus, setWarmStatus] = useState<"idle" | "warming" | "ready">("idle");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setWarmStatus("warming");
    fetch("/api/warmup")
      .then((r) => r.json())
      .then(() => setWarmStatus("ready"))
      .catch(() => setWarmStatus("idle"));
  }, []);

  async function refresh() {
    const res = await fetch("/api/upload");
    const data = await res.json();
    setDocs(data.documents || []);
    onChange?.(data.documents || []);
  }

  async function uploadFile(file: File) {
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
    }
  }

  async function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
    e.target.value = "";
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await uploadFile(file);
  }

  async function handleDelete(docId: string) {
    if (!confirm("Delete this document and all its chunks?")) return;
    await fetch(`/api/upload?docId=${docId}`, { method: "DELETE" });
    await refresh();
  }

  return (
    <div className="space-y-4">
      {/* Upload drop zone */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition ${
          dragOver
            ? "border-amber-400 bg-amber-500/10"
            : "border-white/15 bg-white/[0.02] hover:border-amber-500/40"
        } ${uploading ? "opacity-60 pointer-events-none" : ""}`}
      >
        <div className="text-3xl mb-2">{uploading ? "⏳" : "📤"}</div>
        <div className="font-medium text-stone-100">
          {uploading
            ? "Processing document…"
            : "Click to upload, or drag & drop a file here"}
        </div>
        <div className="text-xs text-stone-500 mt-1">
          Supports PDF, TXT, and MD files
        </div>
        <div className="mt-3 text-xs">
          {warmStatus === "warming" && (
            <span className="text-amber-300">
              ⏳ Loading AI model (~25MB, one-time)…
            </span>
          )}
          {warmStatus === "ready" && (
            <span className="text-amber-400">✓ AI model ready</span>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.md"
          onChange={handleInput}
          disabled={uploading}
          className="hidden"
        />
      </div>

      {error && (
        <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {/* Uploaded documents */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="text-sm font-medium text-stone-300 mb-2">
          Uploaded documents{" "}
          <span className="text-stone-500">({docs.length})</span>
        </div>
        {docs.length === 0 ? (
          <div className="text-sm text-stone-500 py-2">
            No documents yet. Upload your FAQ above to power the AI assistant.
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {docs.map((d) => (
              <li
                key={d.docId}
                className="py-2 flex items-center justify-between text-sm"
              >
                <div>
                  <div className="font-medium text-stone-100">📄 {d.name}</div>
                  <div className="text-xs text-stone-500">
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
    </div>
  );
}
