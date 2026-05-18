import { ObjectId } from "mongodb";

export interface DocumentChunk {
  _id?: ObjectId;
  docId: string;
  docName: string;
  chunkIndex: number;
  text: string;
  embedding: number[];
  createdAt: Date;
}

export interface UploadedDoc {
  _id?: ObjectId;
  docId: string;
  name: string;
  type: "pdf" | "txt";
  sizeBytes: number;
  chunkCount: number;
  createdAt: Date;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
  sources?: { docName: string; score: number }[];
}

export interface Conversation {
  _id?: ObjectId;
  conversationId: string;
  messages: ChatMessage[];
  handoffRequested: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ticket {
  _id?: ObjectId;
  ticketId: string;
  conversationId: string;
  reason: "low_confidence" | "user_requested" | "explicit_handoff";
  summary: string;
  status: "open" | "in_progress" | "resolved";
  createdAt: Date;
}
