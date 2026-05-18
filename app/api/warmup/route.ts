import { NextResponse } from "next/server";
import { warmup } from "@/lib/embeddings";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  try {
    const t0 = Date.now();
    await warmup();
    return NextResponse.json({ ok: true, ms: Date.now() - t0 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Warmup failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
