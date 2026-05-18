import { NextRequest, NextResponse } from "next/server";
import { getDb, COLLECTIONS } from "@/lib/mongodb";
import { Ticket } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  try {
    const db = await getDb();
    const tickets = await db
      .collection<Ticket>(COLLECTIONS.tickets)
      .find({}, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
    return NextResponse.json({ tickets });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to list tickets";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { ticketId, status } = await req.json();
    if (!ticketId || !status) {
      return NextResponse.json(
        { error: "ticketId and status are required" },
        { status: 400 },
      );
    }
    if (!["open", "in_progress", "resolved"].includes(status)) {
      return NextResponse.json({ error: "invalid status" }, { status: 400 });
    }
    const db = await getDb();
    await db.collection<Ticket>(COLLECTIONS.tickets).updateOne(
      { ticketId },
      { $set: { status } },
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
