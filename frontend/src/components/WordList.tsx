'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wordApi, Word } from '@/lib/api';

const WordRow = memo(function WordRow({ w, onDelete }: { w: Word; onDelete: (id: string) => void }) {
  return (
    <div
      className="flex items-center justify-between py-2.5 px-3 mb-1.5"
      style={{ borderBottom: '1px solid rgba(201,149,42,0.1)', background: 'rgba(245,232,204,0.02)' }}
    >
      <div className="flex-1 min-w-0">
        <span style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', color: 'rgba(201,149,42,0.7)', fontSize: '0.85rem' }}>
          {w.article ? w.article + ' ' : ''}
        </span>
        <span style={{ fontFamily: 'var(--font-body)', color: 'var(--color-parchment)', fontSize: '1rem' }}>
          {w.german}
        </span>
        <span className="ml-3" style={{ fontSize: '0.85rem', color: 'rgba(245,232,204,0.45)' }}>
          {w.translation}
        </span>
      </div>
      <button
        onClick={() => onDelete(w.id)}
        style={{ color: 'rgba(245,232,204,0.2)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-rust)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,232,204,0.2)')}
      >
        ✕
      </button>
    </div>
  );
});

export function WordList() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState<string | null>(null);

  const { data: words = [], isLoading } = useQuery<Word[]>({
    queryKey: ['words'],
    queryFn: wordApi.getAll,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const deleteMutation = useMutation({
    mutationFn: wordApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['words'] }),
  });

  const deleteAllMutation = useMutation({
    mutationFn: wordApi.deleteAll,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['words'] }),
  });

  const handleDelete = useCallback((id: string) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  const dateBatches = useMemo(() =>
    Array.from(
      new Set(words.map(w => new Date(w.createdAt).toLocaleDateString('de-DE')))
    ).sort((a, b) => {
      const [da, ma, ya] = a.split('.').map(Number);
      const [db, mb, yb] = b.split('.').map(Number);
      return new Date(yb, mb - 1, db).getTime() - new Date(ya, ma - 1, da).getTime();
    }),
    [words]
  );

  const searchLower = search.toLowerCase();
  const filtered = useMemo(() =>
    words.filter(w => {
      const matchesSearch = !searchLower ||
        w.german.toLowerCase().includes(searchLower) ||
        w.translation.toLowerCase().includes(searchLower);
      const matchesDate = dateFilter === null ||
        new Date(w.createdAt).toLocaleDateString('de-DE') === dateFilter;
      return matchesSearch && matchesDate;
    }),
    [words, searchLower, dateFilter]
  );

  if (isLoading) return (
    <div className="text-center py-12" style={{ color: 'rgba(245,232,204,0.4)', fontFamily: 'var(--font-display)' }}>
      Laden...
    </div>
  );

  return (
    <div>
      {/* Date/batch filter */}
      {dateBatches.length > 0 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs uppercase tracking-widest" style={{ color: 'rgba(245,232,204,0.3)', fontFamily: 'var(--font-mono-custom)' }}>
            Batch:
          </span>
          <button
            onClick={() => setDateFilter(null)}
            className="px-2.5 py-1 text-xs uppercase tracking-wider transition-all"
            style={{
              fontFamily: 'var(--font-mono-custom)',
              border: `1px solid ${dateFilter === null ? 'var(--color-gold)' : 'rgba(201,149,42,0.2)'}`,
              color: dateFilter === null ? 'var(--color-gold)' : 'rgba(245,232,204,0.3)',
              background: dateFilter === null ? 'rgba(201,149,42,0.1)' : 'transparent',
              cursor: 'pointer',
            }}
          >
            Alle
          </button>
          {dateBatches.map(b => (
            <button
              key={b}
              onClick={() => setDateFilter(b)}
              className="px-2.5 py-1 text-xs transition-all"
              style={{
                fontFamily: 'var(--font-mono-custom)',
                border: `1px solid ${dateFilter === b ? 'var(--color-gold)' : 'rgba(201,149,42,0.2)'}`,
                color: dateFilter === b ? 'var(--color-gold)' : 'rgba(245,232,204,0.3)',
                background: dateFilter === b ? 'rgba(201,149,42,0.1)' : 'transparent',
                cursor: 'pointer',
              }}
            >
              {b}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Suche..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 text-sm bg-transparent outline-none"
          style={{
            border: '1px solid rgba(201,149,42,0.3)',
            color: 'var(--color-parchment)',
            fontFamily: 'var(--font-mono-custom)',
          }}
        />
        {words.length > 0 && (
          <button
            onClick={() => confirm('Alle Wörter löschen?') && deleteAllMutation.mutate()}
            className="px-4 py-2 text-xs uppercase tracking-widest"
            style={{
              border: '1px solid rgba(139,46,10,0.5)',
              color: 'var(--color-rust)',
              background: 'transparent',
              fontFamily: 'var(--font-mono-custom)',
              cursor: 'pointer',
            }}
          >
            Alle löschen
          </button>
        )}
      </div>

      <div style={{ maxHeight: '55vh', overflowY: 'auto' }}>
        {filtered.length === 0 && (
          <div className="text-center py-10" style={{ color: 'rgba(245,232,204,0.3)', fontFamily: 'var(--font-body)', fontStyle: 'italic' }}>
            Keine Wörter gefunden.
          </div>
        )}
        {filtered.map(w => (
          <WordRow key={w.id} w={w} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}
