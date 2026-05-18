const DEFAULT_CHUNK_SIZE = 1500;
const DEFAULT_OVERLAP = 150;

export function chunkText(
  text: string,
  chunkSize = DEFAULT_CHUNK_SIZE,
  overlap = DEFAULT_OVERLAP,
): string[] {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];

  const chunks: string[] = [];
  let start = 0;
  while (start < cleaned.length) {
    const end = Math.min(start + chunkSize, cleaned.length);
    let slice = cleaned.slice(start, end);

    if (end < cleaned.length) {
      const lastPeriod = slice.lastIndexOf(". ");
      if (lastPeriod > chunkSize * 0.5) {
        slice = slice.slice(0, lastPeriod + 1);
      }
    }

    chunks.push(slice.trim());
    if (end >= cleaned.length) break;
    start += Math.max(slice.length - overlap, 1);
  }
  return chunks;
}
