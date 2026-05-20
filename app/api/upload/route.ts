import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import pdf from "pdf-parse";
import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { chunkText } from "@/lib/chunker";
import { embedMany } from "@/lib/embeddings";
import { getVectorStore, ChunkRecord } from "@/lib/vectorStore";
import { UploadedDoc } from "@/lib/types";
import { auth } from "@/auth";

export const runtime = "nodejs";
export const maxDuration = 60;

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function POST(req: NextRequest) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const name = file.name;
    const lower = name.toLowerCase();

    let text = "";
    let type: "pdf" | "txt";
    if (lower.endsWith(".pdf")) {
      const parsed = await pdf(buf);
      text = parsed.text;
      type = "pdf";
    } else if (lower.endsWith(".txt") || lower.endsWith(".md")) {
      text = buf.toString("utf-8");
      type = "txt";
    } else {
      return NextResponse.json(
        { error: "Only PDF, TXT, and MD files are supported" },
        { status: 400 },
      );
    }

    if (!text.trim()) {
      return NextResponse.json({ error: "File is empty or unreadable" }, { status: 400 });
    }

    const chunks = chunkText(text);
    if (chunks.length === 0) {
      return NextResponse.json({ error: "No content to index" }, { status: 400 });
    }

    const docId = randomUUID();
    const db = await getDb();
    const now = new Date();

    const docRecord: UploadedDoc = {
      docId,
      name,
      type,
      sizeBytes: buf.length,
      chunkCount: chunks.length,
      createdAt: now,
    };
    await db.collection<UploadedDoc>(COLLECTIONS.documents).insertOne(docRecord);

    const embeddings = await embedMany(chunks);
    const records: ChunkRecord[] = chunks.map((text, i) => ({
      docId,
      docName: name,
      chunkIndex: i,
      text,
      embedding: embeddings[i],
    }));

    const store = getVectorStore();
    await store.upsert(records);

    return NextResponse.json({
      success: true,
      docId,
      name,
      chunkCount: chunks.length,
      vectorStore: store.name,
    });
  } catch (err) {
    console.error("Upload error:", err);
    const msg = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = await getDb();
    const docs = await db
      .collection<UploadedDoc>(COLLECTIONS.documents)
      .find({}, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json({ documents: docs });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to list documents";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  try {
    const { searchParams } = new URL(req.url);
    const docId = searchParams.get("docId");
    if (!docId) {
      return NextResponse.json({ error: "docId required" }, { status: 400 });
    }
    const db = await getDb();
    const store = getVectorStore();
    await store.deleteByDocId(docId);
    await db.collection(COLLECTIONS.documents).deleteOne({ docId });
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
