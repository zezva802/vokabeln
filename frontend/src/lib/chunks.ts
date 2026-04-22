import { Word } from './api';

export const CHUNK_SIZES = [10, 20, 50] as const;
export type ChunkSize = typeof CHUNK_SIZES[number];
export const DEFAULT_CHUNK_SIZE: ChunkSize = 20;

export interface Chunk {
  index: number;
  label: string;
  from: number;
  to: number;
  words: Word[];
}

export function buildChunks(
  allWords: Word[],
  size: ChunkSize,
): Chunk[] {
  const pool = [...allWords].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const chunks: Chunk[] = [];
  for (let i = 0; i < pool.length; i += size) {
    const slice = pool.slice(i, i + size);
    const from = i + 1;
    const to = i + slice.length;
    chunks.push({
      index: chunks.length,
      label: `${from}–${to}`,
      from,
      to,
      words: slice,
    });
  }
  return chunks;
}
