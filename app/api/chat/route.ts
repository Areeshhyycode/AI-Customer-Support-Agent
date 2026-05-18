import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { embed } from "@/lib/embeddings";
import { getVectorStore } from "@/lib/vectorStore";
import { groq, GROQ_MODEL } from "@/lib/groq";
import { ChatMessage, Conversation, Ticket } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const CONFIDENCE_THRESHOLD = parseFloat(
  process.env.RAG_CONFIDENCE_THRESHOLD || "0.55",
);

const SYSTEM_PROMPT = `You are a helpful customer support assistant for the company. Answer using ONLY the provided context from the knowledge base.

Rules:
- If the context contains the answer, give it clearly and concisely.
- If the context does NOT contain enough information, reply EXACTLY with: "I don't have enough information to answer that. I'll connect you with a human agent."
- Never invent facts, prices, policies, or details not in the context.
- Keep answers under 150 words unless the user asks for detail.
- Be friendly and professional.`;

function isHandoffIntent(text: string): boolean {
  const t = text.toLowerCase();
  return (
    t.includes("human") ||
    t.includes("agent") ||
    t.includes("representative") ||
    t.includes("speak to someone") ||
    t.includes("talk to a person")
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message: string = body.message;
    let conversationId: string = body.conversationId || randomUUID();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const db = await getDb();
    const conversations = db.collection<Conversation>(COLLECTIONS.conversations);
    const tickets = db.collection<Ticket>(COLLECTIONS.tickets);

    const existing = await conversations.findOne({ conversationId });
    const history: ChatMessage[] = existing?.messages ?? [];

    if (isHandoffIntent(message)) {
      const ticketId = randomUUID();
      const userMsg: ChatMessage = {
        role: "user",
        content: message,
        createdAt: new Date(),
      };
      const reply =
        "Got it — I'm escalating this to a human agent. A support representative will reach out shortly. Your ticket has been created.";
      const aiMsg: ChatMessage = {
        role: "assistant",
        content: reply,
        createdAt: new Date(),
      };
      const newHistory = [...history, userMsg, aiMsg];

      await conversations.updateOne(
        { conversationId },
        {
          $set: {
            conversationId,
            messages: newHistory,
            handoffRequested: true,
            updatedAt: new Date(),
          },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true },
      );

      await tickets.insertOne({
        ticketId,
        conversationId,
        reason: "user_requested",
        summary: message.slice(0, 200),
        status: "open",
        createdAt: new Date(),
      });

      return NextResponse.json({
        conversationId,
        reply,
        handoff: true,
        ticketId,
        sources: [],
      });
    }

    const queryEmbedding = await embed(message);
    const hits = await getVectorStore().query(queryEmbedding, 5);
    const topScore = hits[0]?.score ?? 0;
    const lowConfidence = topScore < CONFIDENCE_THRESHOLD;

    const contextBlock =
      hits.length > 0
        ? hits
            .map(
              (h, i) =>
                `[Source ${i + 1} — ${h.docName} (score: ${h.score.toFixed(3)})]\n${h.text}`,
            )
            .join("\n\n")
        : "No relevant context found in the knowledge base.";

    const recentHistory = history.slice(-6).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      temperature: 0.2,
      max_tokens: 500,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...recentHistory,
        {
          role: "user",
          content: `CONTEXT FROM KNOWLEDGE BASE:\n${contextBlock}\n\nUSER QUESTION: ${message}`,
        },
      ],
    });

    const reply =
      completion.choices[0]?.message?.content?.trim() ||
      "I'm sorry, I couldn't generate a response.";

    const cannotAnswer = reply
      .toLowerCase()
      .includes("don't have enough information");
    const shouldHandoff = cannotAnswer || (lowConfidence && hits.length === 0);

    let ticketId: string | undefined;
    if (shouldHandoff) {
      ticketId = randomUUID();
      await tickets.insertOne({
        ticketId,
        conversationId,
        reason: cannotAnswer ? "low_confidence" : "low_confidence",
        summary: message.slice(0, 200),
        status: "open",
        createdAt: new Date(),
      });
    }

    const userMsg: ChatMessage = {
      role: "user",
      content: message,
      createdAt: new Date(),
    };
    const aiMsg: ChatMessage = {
      role: "assistant",
      content: reply,
      createdAt: new Date(),
      sources: hits.map((h) => ({ docName: h.docName, score: h.score })),
    };
    const newHistory = [...history, userMsg, aiMsg];

    await conversations.updateOne(
      { conversationId },
      {
        $set: {
          conversationId,
          messages: newHistory,
          handoffRequested: existing?.handoffRequested || shouldHandoff,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );

    return NextResponse.json({
      conversationId,
      reply,
      handoff: shouldHandoff,
      ticketId,
      sources: hits.map((h) => ({
        docName: h.docName,
        score: Number(h.score.toFixed(3)),
      })),
    });
  } catch (err) {
    console.error("Chat error:", err);
    const msg = err instanceof Error ? err.message : "Chat failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");
    if (!conversationId) {
      return NextResponse.json({ error: "conversationId required" }, { status: 400 });
    }
    const db = await getDb();
    const conv = await db
      .collection<Conversation>(COLLECTIONS.conversations)
      .findOne({ conversationId }, { projection: { _id: 0 } });
    return NextResponse.json({ conversation: conv });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load conversation";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
