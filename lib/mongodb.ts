import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "ai_support";

if (!uri) {
  throw new Error("MONGODB_URI is not set in environment variables");
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

const client = global._mongoClient ?? new MongoClient(uri);
if (process.env.NODE_ENV !== "production") {
  global._mongoClient = client;
}

let connected = false;

export async function getDb(): Promise<Db> {
  if (!connected) {
    await client.connect();
    connected = true;
  }
  return client.db(dbName);
}

export const COLLECTIONS = {
  chunks: "chunks",
  documents: "documents",
  conversations: "conversations",
  tickets: "tickets",
} as const;
