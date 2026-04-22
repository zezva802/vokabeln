'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { wordApi, Word } from '@/lib/api';
import { buildChunks, ChunkSize, DEFAULT_CHUNK_SIZE } from '@/lib/chunks';
import { ChunkPicker } from './ChunkPicker';

const MASTER_STREAK = 2; // answer right twice in a row to retire from chunk

const SELF_RATINGS = [
  { label: 'Falsch', color: '#8b2e0a', border: 'rgba(139,46,10,0.6)', correct: false, key: '1', quality: 1 },
  { label: 'Richtig', color: '#4a6e1a', border: 'rgba(74,110,26,0.6)', correct: true, key: '2', quality: 4 },
] as const;

function pickNext(
  words: Word[],
  streaks: Record<string, number>,
  previousId: string | null,
): Word | null {
  const remaining = words.filter(w => (streaks[w.id] ?? 0) < MASTER_STREAK);
  if (remaining.length === 0) return null;
  const pool = remaining.length > 1 ? remaining.filter(w => w.id !== previousId) : remaining;
  // Weight: words with 0 streak weight 3, 1 streak weight 1
  const weighted: Word[] = [];
  for (const w of pool) {
    const s = streaks[w.id] ?? 0;
    const weight = s === 0 ? 3 : 1;
    for (let i = 0; i < weight; i++) weighted.push(w);
  }
  return weighted[Math.floor(Math.random() * weighted.length)];
}

export function Practice() {
  const [direction, setDirection] = useState<'de' | 'ka'>('de');
  const [flipped, setFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [current, setCurrent] = useState<Word | null>(null);
  const [chunkSize, setChunkSize] = useState<ChunkSize>(DEFAULT_CHUNK_SIZE);
  const [chunkIndex, setChunkIndex] = useState<number | null>(0);
  const [streaks, setStreaks] = useState<Record<string, number>>({});

  const { data: allWords = [], isLoading } = useQuery<Word[]>({
    queryKey: ['words'],
    queryFn: wordApi.getAll,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const chunks = useMemo(
    () => buildChunks(allWords, chunkSize),
    [allWords, chunkSize],
  );

  const activeWords = useMemo(() => {
    if (chunks.length === 0) return [];
    if (chunkIndex === null) return chunks.flatMap(c => c.words);
    return chunks[Math.min(chunkIndex, chunks.length - 1)]?.words ?? [];
  }, [chunks, chunkIndex]);

  // Reset session when pool changes
  const poolKey = activeWords.map(w => w.id).join(',');
  const lastPoolKey = useRef(poolKey);
  useEffect(() => {
    if (lastPoolKey.current !== poolKey) {
      lastPoolKey.current = poolKey;
      setStreaks({});
      setSessionStats({ correct: 0, total: 0 });
      setFlipped(false);
      setCurrent(pickNext(activeWords, {}, null));
    }
  }, [poolKey, activeWords]);

  // Initial pick
  useEffect(() => {
    if (!current && activeWords.length > 0) {
      setCurrent(pickNext(activeWords, streaks, null));
    }
  }, [activeWords, current, streaks]);

  const handleRate = useCallback((correct: boolean, quality: number) => {
    if (!current) return;
    const nextStreaks = {
      ...streaks,
      [current.id]: correct ? (streaks[current.id] ?? 0) + 1 : 0,
    };
    setStreaks(nextStreaks);
    setSessionStats(s => ({
      correct: s.correct + (correct ? 1 : 0),
      total: s.total + 1,
    }));
    setFlipped(false);
    setTimeout(() => {
      setCurrent(pickNext(activeWords, nextStreaks, current.id));
    }, 120);
  }, [current, streaks, activeWords]);

  const handleRestart = useCallback(() => {
    setStreaks({});
    setSessionStats({ correct: 0, total: 0 });
    setFlipped(false);
    setCurrent(pickNext(activeWords, {}, null));
  }, [activeWords]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space' && !flipped && current) {
      e.preventDefault();
      setFlipped(true);
    }
    if (flipped && current) {
      const rating = SELF_RATINGS.find(r => r.key === e.key);
      if (rating) {
        e.preventDefault();
        handleRate(rating.correct, rating.quality);
      }
    }
  }, [flipped, current, handleRate]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (isLoading) {
    return (
      <div className="text-center py-20" style={{ color: 'rgba(245,232,204,0.4)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}>Laden…</div>
      </div>
    );
  }

  if (allWords.length === 0) {
    return (
      <div className="feldpost-border text-center py-16 px-8" style={{ background: 'rgba(245,232,204,0.03)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--color-gold)' }}>
          Keine Wörter
        </div>
        <p className="mt-3 text-sm italic" style={{ color: 'rgba(245,232,204,0.5)' }}>
          Importiere zuerst einige Vokabeln.
        </p>
      </div>
    );
  }

  const masteredInChunk = activeWords.filter(w => (streaks[w.id] ?? 0) >= MASTER_STREAK).length;
  const chunkSize_ = activeWords.length;
  const pct = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;

  return (
    <div className="animate-in">
      {/* Mode header */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span
          className="px-2.5 py-1 text-xs uppercase tracking-widest"
          style={{
            fontFamily: 'var(--font-mono-custom)',
            border: '1px solid rgba(77,93,83,0.5)',
            color: 'var(--color-feldgrau)',
            background: 'rgba(77,93,83,0.1)',
          }}
          title="Drill durch eine Gruppe: 2× richtig in Folge = Wort gemeistert. Antworten werden gespeichert."
        >
          Drill-Modus
        </span>
        <button
          onClick={() => setDirection(d => d === 'de' ? 'ka' : 'de')}
          className="px-3 py-1.5 text-xs tracking-wider transition-all flex items-center gap-1.5"
          style={{
            fontFamily: 'var(--font-mono-custom)',
            border: '1px solid rgba(201,149,42,0.3)',
            color: 'var(--color-gold)',
            background: 'rgba(201,149,42,0.06)',
            cursor: 'pointer',
          }}
        >
          {direction === 'de' ? 'DE → KA' : 'KA → DE'}
          <span style={{ opacity: 0.4, fontSize: '0.65rem' }}>⇄</span>
        </button>
      </div>

      <ChunkPicker
        chunks={chunks}
        size={chunkSize}
        selectedIndex={chunkIndex}
        totalPool={chunks.reduce((n, c) => n + c.words.length, 0)}
        onSizeChange={setChunkSize}
        onSelect={setChunkIndex}
      />

      {/* Chunk progress */}
      {chunkSize_ > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px" style={{ background: 'rgba(201,149,42,0.2)' }}>
            <div
              className="h-px transition-all duration-500"
              style={{ width: `${(masteredInChunk / chunkSize_) * 100}%`, background: 'var(--color-gold)' }}
            />
          </div>
          <span style={{ fontFamily: 'var(--font-mono-custom)', fontSize: '0.75rem', color: 'rgba(245,232,204,0.4)' }}>
            {masteredInChunk}/{chunkSize_} gemeistert
          </span>
        </div>
      )}

      {/* Session score */}
      {sessionStats.total > 0 && (
        <div className="flex items-center gap-4 mb-4" style={{ fontFamily: 'var(--font-mono-custom)', fontSize: '0.75rem' }}>
          <span style={{ color: 'var(--color-gold)' }}>✓ {sessionStats.correct}</span>
          <span style={{ color: 'var(--color-rust)' }}>✕ {sessionStats.total - sessionStats.correct}</span>
          <span style={{ color: 'rgba(245,232,204,0.4)' }}>{pct}%</span>
          <span style={{ color: 'rgba(245,232,204,0.25)' }}>#{sessionStats.total}</span>
          <div className="flex-1" />
          <button
            onClick={handleRestart}
            className="text-xs uppercase tracking-widest"
            style={{ color: 'rgba(245,232,204,0.3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono-custom)' }}
          >
            Reset
          </button>
        </div>
      )}

      {/* Completion */}
      {!current && chunkSize_ > 0 && masteredInChunk === chunkSize_ && (
        <div className="feldpost-border text-center py-12 px-8" style={{ background: 'rgba(245,232,204,0.03)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', color: 'var(--color-gold)' }}>
            Gruppe gemeistert!
          </div>
          <p className="mt-3 text-sm italic" style={{ color: 'rgba(245,232,204,0.5)' }}>
            Alle {chunkSize_} Wörter 2× in Folge richtig.
          </p>
          <button
            onClick={handleRestart}
            className="mt-6 px-6 py-2 text-sm uppercase tracking-widest"
            style={{
              border: '1px solid var(--color-gold)',
              color: 'var(--color-gold)',
              background: 'transparent',
              fontFamily: 'var(--font-mono-custom)',
              cursor: 'pointer',
            }}
          >
            Nochmal
          </button>
        </div>
      )}

      {/* Card */}
      {current && (
        <>
          <div
            className="flip-container mb-6 cursor-pointer"
            onClick={() => !flipped && setFlipped(true)}
          >
            <div className={`flip-inner ${flipped ? 'flipped' : ''}`}>
              <div
                className="flip-front feldpost-border flex flex-col items-center justify-center px-8 py-12"
                style={{ background: 'rgba(245,232,204,0.05)', minHeight: 280 }}
              >
                <div
                  className="text-xs uppercase tracking-[0.25em] mb-4"
                  style={{ color: 'rgba(245,232,204,0.35)', fontFamily: 'var(--font-mono-custom)' }}
                >
                  {direction === 'de'
                    ? `${current.type ?? 'Wort'}`
                    : `Übersetze nach Deutsch`
                  }
                </div>
                {direction === 'de' && current.article && (
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '1.1rem', color: 'var(--color-gold)', fontStyle: 'italic' }}>
                    {current.article}
                  </div>
                )}
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '2.8rem',
                  fontWeight: 700,
                  color: 'var(--color-parchment)',
                  lineHeight: 1.2,
                  textAlign: 'center',
                  letterSpacing: '0.01em',
                }}>
                  {direction === 'de' ? current.german : current.translation}
                </div>
                <div className="mt-8 flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest" style={{ color: 'rgba(245,232,204,0.2)' }}>
                    Umdrehen
                  </span>
                  <span className="kbd">Space</span>
                </div>
              </div>

              <div
                className="flip-back feldpost-border flex flex-col items-center justify-center px-8 py-12"
                style={{ background: 'rgba(201,149,42,0.06)', minHeight: 280 }}
              >
                <div
                  className="text-xs uppercase tracking-[0.25em] mb-4"
                  style={{ color: 'rgba(245,232,204,0.35)', fontFamily: 'var(--font-mono-custom)' }}
                >
                  {direction === 'de' ? 'Übersetzung' : 'Deutsch'}
                </div>
                {direction === 'ka' && current.article && (
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'rgba(245,232,204,0.5)', fontStyle: 'italic' }}>
                    {current.article}
                  </div>
                )}
                <div
                  style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', fontWeight: 700, color: 'var(--color-gold)', textAlign: 'center', lineHeight: 1.3 }}
                >
                  {direction === 'de' ? current.translation : current.german}
                </div>
                <div className="mt-3" style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'rgba(245,232,204,0.5)', fontStyle: 'italic' }}>
                  {direction === 'de'
                    ? (current.article ? `${current.article} ${current.german}` : current.german)
                    : current.translation
                  }
                </div>
              </div>
            </div>
          </div>

          {flipped && (
            <div className="grid grid-cols-2 gap-3 animate-in">
              {SELF_RATINGS.map(({ label, color, border, correct, key, quality }) => (
                <button
                  key={label}
                  onClick={() => handleRate(correct, quality)}
                  className="py-3 px-2 text-center transition-all"
                  style={{
                    border: `1px solid ${border}`,
                    background: 'transparent',
                    color,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono-custom)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = `${border}`)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div className="text-sm font-bold">{label}</div>
                  <span className="kbd mt-1">{key}</span>
                </button>
              ))}
            </div>
          )}

          {!flipped && (
            <div className="text-center">
              <button
                className="px-8 py-2 text-sm uppercase tracking-widest"
                style={{
                  border: '1px solid rgba(201,149,42,0.4)',
                  color: 'var(--color-gold)',
                  background: 'transparent',
                  fontFamily: 'var(--font-mono-custom)',
                  cursor: 'pointer',
                }}
                onClick={() => setFlipped(true)}
              >
                Antwort zeigen
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
