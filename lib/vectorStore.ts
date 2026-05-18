import { Pinecone } from "@pinecone-database/pinecone";
import { getDb, COLLECTIONS } from "./mongodb";
import { DocumentChunk } from "./types";

export interface ChunkRecord {
  docId: string;
  docName: string;
  chunkIndex: number;
  text: string;
  embedding: number[];
}

export interface SearchHit {
  text: string;
  docName: string;
  score: number;
}

export interface VectorStore {
  name: "mongodb" | "pinecone";
  upsert(chunks: ChunkRecord[]): Promise<void>;
  query(embedding: number[], k: number): Promise<SearchHit[]>;
  deleteByDocId(docId: string): Promise<void>;
}

// ============================================================
// MongoDB Atlas Vector Search implementation
// ============================================================

const mongoStore: VectorStore = {
  name: "mongodb",

  async upsert(chunks) {
    if (chunks.length === 0) return;
    const db = await getDb();
    const docs: DocumentChunk[] = chunks.map((c) => ({
      docId: c.docId,
      docName: c.docName,
      chunkIndex: c.chunkIndex,
      text: c.text,
      embedding: c.embedding,
      createdAt: new Date(),
    }));
    await db.collection<DocumentChunk>(COLLECTIONS.chunks).insertMany(docs);
  },

  async query(embedding, k) {
    const db = await getDb();
    const pipeline = [
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: embedding,
          numCandidates: 100,
          limit: k,
        },
      },
      {
        $project: {
          _id: 0,
          text: 1,
          docName: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ];

    try {
      return await db
        .collection<DocumentChunk>(COLLECTIONS.chunks)
        .aggregate<SearchHit>(pipeline)
        .toArray();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("$vectorSearch") || msg.includes("index")) {
        console.warn("Vector index not found, falling back to in-memory cosine search");
        return inMemoryFallback(embedding, k);
      }
      throw err;
    }
  },

  async deleteByDocId(docId) {
    const db = await getDb();
    await db.collection(COLLECTIONS.chunks).deleteMany({ docId });
  },
};

async function inMemoryFallback(
  queryEmbedding: number[],
  k: number,
): Promise<SearchHit[]> {
  const db = await getDb();
  const chunks = await db
    .collection<DocumentChunk>(COLLECTIONS.chunks)
    .find({}, { projection: { text: 1, docName: 1, embedding: 1 } })
    .toArray();

  const scored = chunks.map((c) => ({
    text: c.text,
    docName: c.docName,
    score: cosineSimilarity(queryEmbedding, c.embedding),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

// ============================================================
// Pinecone implementation
// ============================================================

let pineconeClient: Pinecone | null = null;
function getPinecone(): Pinecone {
  if (!pineconeClient) {
    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey) {
      throw new Error(
        "PINECONE_API_KEY is required when VECTOR_DB=pinecone",
      );
    }
    pineconeClient = new Pinecone({ apiKey });
  }
  return pineconeClient;
}

function getIndexName(): string {
  const name = process.env.PINECONE_INDEX_NAME;
  if (!name) {
    throw new Error("PINECONE_INDEX_NAME is required when VECTOR_DB=pinecone");
  }
  return name;
}

const pineconeStore: VectorStore = {
  name: "pinecone",

  async upsert(chunks) {
    if (chunks.length === 0) return;
    const index = getPinecone().index(getIndexName());
    const vectors = chunks.map((c) => ({
      id: `${c.docId}_${c.chunkIndex}`,
      values: c.embedding,
      metadata: {
        text: c.text,
        docName: c.docName,
        docId: c.docId,
        chunkIndex: c.chunkIndex,
      },
    }));
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      await index.upsert({ records: vectors.slice(i, i + batchSize) });
    }
  },

  async query(embedding, k) {
    const index = getPinecone().index(getIndexName());
    const res = await index.query({
      vector: embedding,
      topK: k,
      includeMetadata: true,
    });
    return (res.matches || []).map((m) => ({
      text: String(m.metadata?.text ?? ""),
      docName: String(m.metadata?.docName ?? "unknown"),
      score: m.score ?? 0,
    }));
  },

  async deleteByDocId(docId) {
    const index = getPinecone().index(getIndexName());
    // Pinecone serverless doesn't support metadata filter delete on free tier;
    // we list IDs via the documents collection's chunkCount and delete by id pattern.
    const db = await getDb();
    const doc = await db
      .collection(COLLECTIONS.documents)
      .findOne<{ chunkCount: number }>({ docId });
    if (!doc) return;
    const ids = Array.from(
      { length: doc.chunkCount },
      (_, i) => `${docId}_${i}`,
    );
    const batchSize = 100;
    for (let i = 0; i < ids.length; i += batchSize) {
      await index.deleteMany({ ids: ids.slice(i, i + batchSize) });
    }
  },
};

// ============================================================
// Public selector
// ============================================================

export function getVectorStore(): VectorStore {
  const choice = (process.env.VECTOR_DB || "mongodb").toLowerCase();
  if (choice === "pinecone") return pineconeStore;
  return mongoStore;
}
