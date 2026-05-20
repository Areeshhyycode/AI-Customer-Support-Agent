import { pipeline, env, FeatureExtractionPipeline } from "@xenova/transformers";

export const EMBEDDING_DIM = 384;

const HF_TOKEN = process.env.HF_TOKEN;
const HF_MODEL = "sentence-transformers/all-MiniLM-L6-v2";
const HF_URL = `https://api-inference.huggingface.co/pipeline/feature-extraction/${HF_MODEL}`;

/**
 * Embeddings have two backends:
 *  - Hugging Face Inference API  (used when HF_TOKEN is set — fast, no model
 *    download, ideal for Vercel)
 *  - Local Xenova transformers   (fallback for local dev without a token)
 * Both use all-MiniLM-L6-v2, so the 384-dim vectors are interchangeable.
 */

// ----------------------------------------------------------------
// Hugging Face Inference API backend
// ----------------------------------------------------------------

async function hfEmbed(texts: string[]): Promise<number[][]> {
  const res = await fetch(HF_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: texts,
      options: { wait_for_model: true },
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Hugging Face API error ${res.status}: ${detail}`);
  }

  const data = (await res.json()) as number[][] | number[];
  // Single input may come back as a flat array — normalize to number[][]
  if (Array.isArray(data) && typeof data[0] === "number") {
    return [data as number[]];
  }
  return data as number[][];
}

// ----------------------------------------------------------------
// Local Xenova backend
// ----------------------------------------------------------------

env.allowLocalModels = false;
env.useBrowserCache = false;

let extractorPromise: Promise<FeatureExtractionPipeline> | null = null;

async function getExtractor(): Promise<FeatureExtractionPipeline> {
  if (!extractorPromise) {
    extractorPromise = pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2",
    ) as Promise<FeatureExtractionPipeline>;
  }
  return extractorPromise;
}

async function xenovaEmbed(text: string): Promise<number[]> {
  const extractor = await getExtractor();
  const output = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(output.data as Float32Array);
}

// ----------------------------------------------------------------
// Public API
// ----------------------------------------------------------------

export function embeddingBackend(): "huggingface" | "xenova" {
  return HF_TOKEN ? "huggingface" : "xenova";
}

export async function embed(text: string): Promise<number[]> {
  if (HF_TOKEN) {
    const [vec] = await hfEmbed([text]);
    return vec;
  }
  return xenovaEmbed(text);
}

export async function embedMany(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  if (HF_TOKEN) {
    return hfEmbed(texts);
  }
  const out: number[][] = [];
  for (const t of texts) {
    out.push(await xenovaEmbed(t));
  }
  return out;
}

export async function warmup(): Promise<void> {
  if (HF_TOKEN) {
    await hfEmbed(["warmup"]);
    return;
  }
  await getExtractor();
  await xenovaEmbed("warmup");
}
