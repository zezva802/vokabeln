export const CHUNK_SIZES = [10, 20, 50] as const;
export type ChunkSize = typeof CHUNK_SIZES[number];
export const DEFAULT_CHUNK_SIZE: ChunkSize = 20;

export interface Chunk<T = { id: string; createdAt: string }> {
  index: number;
  label: string;
  from: number;
  to: number;
  words: T[];
}

export function buildChunks<T extends { id: string; createdAt: string }>(
  allItems: T[],
  size: ChunkSize,
): Chunk<T>[] {
  const pool = [...allItems].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const chunks: Chunk<T>[] = [];
  for (let i = 0; i < pool.length; i += size) {
    const slice = pool.slice(i, i + size);
    chunks.push({
      index: chunks.length,
      label: `${i + 1}–${i + slice.length}`,
      from: i + 1,
      to: i + slice.length,
      words: slice,
    });
  }
  return chunks;
}
