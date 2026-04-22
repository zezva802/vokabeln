'use client';

import { Chunk, CHUNK_SIZES, ChunkSize } from '@/lib/chunks';

interface Props {
  chunks: Chunk[];
  size: ChunkSize;
  selectedIndex: number | null;
  totalPool: number;
  onSizeChange: (s: ChunkSize) => void;
  onSelect: (index: number | null) => void;
}

const monoLabel = { fontFamily: 'var(--font-mono-custom)' };

export function ChunkPicker({
  chunks, size, selectedIndex, totalPool,
  onSizeChange, onSelect,
}: Props) {
  return (
    <div className="mb-4">
      {/* Controls row */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <span className="text-xs uppercase tracking-widest" style={{ ...monoLabel, color: 'rgba(245,232,204,0.3)' }}>
          Gruppe
        </span>
        <div className="flex gap-1">
          {CHUNK_SIZES.map(s => (
            <button
              key={s}
              onClick={() => onSizeChange(s)}
              className="px-2.5 py-1 text-xs transition-all"
              style={{
                ...monoLabel,
                border: `1px solid ${size === s ? 'var(--color-gold)' : 'rgba(201,149,42,0.2)'}`,
                color: size === s ? 'var(--color-gold)' : 'rgba(245,232,204,0.3)',
                background: size === s ? 'rgba(201,149,42,0.1)' : 'transparent',
                cursor: 'pointer',
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <span className="text-xs ml-auto" style={{ ...monoLabel, color: 'rgba(245,232,204,0.3)' }}>
          {totalPool} Wörter
        </span>
      </div>

      {/* Chunk buttons */}
      {chunks.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onSelect(null)}
            className="px-2.5 py-1 text-xs uppercase tracking-wider transition-all"
            style={{
              ...monoLabel,
              border: `1px solid ${selectedIndex === null ? 'var(--color-gold)' : 'rgba(201,149,42,0.2)'}`,
              color: selectedIndex === null ? 'var(--color-gold)' : 'rgba(245,232,204,0.3)',
              background: selectedIndex === null ? 'rgba(201,149,42,0.1)' : 'transparent',
              cursor: 'pointer',
            }}
          >
            Alle
          </button>
          {chunks.map(c => {
            const isNewest = c.index === 0;
            const active = selectedIndex === c.index;
            return (
              <button
                key={c.index}
                onClick={() => onSelect(c.index)}
                title={`Wörter ${c.label}${isNewest ? ' (neueste)' : ''}`}
                className="px-2.5 py-1 text-xs transition-all"
                style={{
                  ...monoLabel,
                  border: `1px solid ${active ? 'var(--color-gold)' : 'rgba(201,149,42,0.2)'}`,
                  color: active ? 'var(--color-gold)' : 'rgba(245,232,204,0.35)',
                  background: active ? 'rgba(201,149,42,0.1)' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                {c.label}
                {isNewest && <span className="ml-1" style={{ opacity: 0.6 }}>★</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
