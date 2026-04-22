'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { verbApi, Verb } from '@/lib/api';
import { buildChunks, ChunkSize, DEFAULT_CHUNK_SIZE } from '@/lib/chunks';
import { ChunkPicker } from './ChunkPicker';

const MASTER_STREAK = 2;

type Field = 'imperfekt' | 'partizip2';
interface Answer { imperfekt: string; partizip2: string }
interface Result { imperfekt: boolean; partizip2: boolean }

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function pickNext(verbs: Verb[], streaks: Record<string, number>, previousId: string | null): Verb | null {
  const remaining = verbs.filter(v => (streaks[v.id] ?? 0) < MASTER_STREAK);
  if (remaining.length === 0) return null;
  const pool = remaining.length > 1 ? remaining.filter(v => v.id !== previousId) : remaining;
  const weighted: Verb[] = [];
  for (const v of pool) {
    const s = streaks[v.id] ?? 0;
    const weight = s === 0 ? 3 : 1;
    for (let i = 0; i < weight; i++) weighted.push(v);
  }
  return weighted[Math.floor(Math.random() * weighted.length)];
}

export function VerbPractice() {
  const [chunkSize, setChunkSize] = useState<ChunkSize>(DEFAULT_CHUNK_SIZE);
  const [chunkIndex, setChunkIndex] = useState<number | null>(0);
  const [streaks, setStreaks] = useState<Record<string, number>>({});
  const [current, setCurrent] = useState<Verb | null>(null);
  const [answer, setAnswer] = useState<Answer>({ imperfekt: '', partizip2: '' });
  const [result, setResult] = useState<Result | null>(null);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const imperfektRef = useRef<HTMLInputElement>(null);

  const { data: allVerbs = [], isLoading } = useQuery<Verb[]>({
    queryKey: ['verbs'],
    queryFn: verbApi.getAll,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const chunks = useMemo(() => buildChunks(allVerbs, chunkSize), [allVerbs, chunkSize]);

  const activeVerbs = useMemo(() => {
    if (chunks.length === 0) return [];
    if (chunkIndex === null) return chunks.flatMap(c => c.words);
    return chunks[Math.min(chunkIndex, chunks.length - 1)]?.words ?? [];
  }, [chunks, chunkIndex]);

  const poolKey = activeVerbs.map(v => v.id).join(',');
  const lastPoolKey = useRef(poolKey);
  useEffect(() => {
    if (lastPoolKey.current !== poolKey) {
      lastPoolKey.current = poolKey;
      setStreaks({});
      setSessionStats({ correct: 0, total: 0 });
      setResult(null);
      setAnswer({ imperfekt: '', partizip2: '' });
      setCurrent(pickNext(activeVerbs, {}, null));
    }
  }, [poolKey, activeVerbs]);

  useEffect(() => {
    if (!current && activeVerbs.length > 0 && Object.keys(streaks).length === 0) {
      setCurrent(pickNext(activeVerbs, {}, null));
    }
  }, [activeVerbs, current, streaks]);

  const handleCheck = useCallback(() => {
    if (!current || result) return;
    const r = {
      imperfekt: normalize(answer.imperfekt) === normalize(current.imperfekt),
      partizip2: normalize(answer.partizip2) === normalize(current.partizip2),
    };
    setResult(r);
    const allCorrect = r.imperfekt && r.partizip2;
    setSessionStats(s => ({
      correct: s.correct + (allCorrect ? 1 : 0),
      total: s.total + 1,
    }));
    const nextStreaks = {
      ...streaks,
      [current.id]: allCorrect ? (streaks[current.id] ?? 0) + 1 : 0,
    };
    setStreaks(nextStreaks);
  }, [current, answer, result, streaks]);

  const handleNext = useCallback(() => {
    const nextStreaks = streaks;
    const next = pickNext(activeVerbs, nextStreaks, current?.id ?? null);
    setCurrent(next);
    setAnswer({ imperfekt: '', partizip2: '' });
    setResult(null);
    setTimeout(() => imperfektRef.current?.focus(), 50);
  }, [activeVerbs, current, streaks]);

  const handleRestart = useCallback(() => {
    setStreaks({});
    setSessionStats({ correct: 0, total: 0 });
    setResult(null);
    setAnswer({ imperfekt: '', partizip2: '' });
    setCurrent(pickNext(activeVerbs, {}, null));
  }, [activeVerbs]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Enter') {
        e.preventDefault();
        if (result) handleNext();
        else handleCheck();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [result, handleCheck, handleNext]);

  if (isLoading) return (
    <div className="text-center py-20" style={{ color: 'rgba(245,232,204,0.4)', fontFamily: 'var(--font-display)', fontSize: '2rem' }}>
      Laden…
    </div>
  );

  if (allVerbs.length === 0) return (
    <div className="feldpost-border text-center py-12 px-8" style={{ background: 'rgba(245,232,204,0.03)' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--color-gold)' }}>Keine Verben</div>
      <p className="mt-3 text-sm italic" style={{ color: 'rgba(245,232,204,0.5)' }}>Importiere zuerst einige Verben.</p>
    </div>
  );

  const masteredInChunk = activeVerbs.filter(v => (streaks[v.id] ?? 0) >= MASTER_STREAK).length;
  const chunkTotal = activeVerbs.length;
  const pct = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;
  const done = !current && chunkTotal > 0 && masteredInChunk === chunkTotal;

  return (
    <div className="animate-in">
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span
          className="px-2.5 py-1 text-xs uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-mono-custom)', border: '1px solid rgba(74,110,26,0.5)', color: '#6a9e3a', background: 'rgba(74,110,26,0.08)' }}
        >
          Verben-Drill
        </span>
      </div>

      <ChunkPicker
        chunks={chunks}
        size={chunkSize}
        selectedIndex={chunkIndex}
        totalPool={chunks.reduce((n, c) => n + c.words.length, 0)}
        onSizeChange={setChunkSize}
        onSelect={setChunkIndex}
      />

      {chunkTotal > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px" style={{ background: 'rgba(201,149,42,0.2)' }}>
            <div
              className="h-px transition-all duration-500"
              style={{ width: `${(masteredInChunk / chunkTotal) * 100}%`, background: 'var(--color-gold)' }}
            />
          </div>
          <span style={{ fontFamily: 'var(--font-mono-custom)', fontSize: '0.75rem', color: 'rgba(245,232,204,0.4)' }}>
            {masteredInChunk}/{chunkTotal} gemeistert
          </span>
        </div>
      )}

      {sessionStats.total > 0 && (
        <div className="flex items-center gap-4 mb-4" style={{ fontFamily: 'var(--font-mono-custom)', fontSize: '0.75rem' }}>
          <span style={{ color: 'var(--color-gold)' }}>✓ {sessionStats.correct}</span>
          <span style={{ color: 'var(--color-rust)' }}>✕ {sessionStats.total - sessionStats.correct}</span>
          <span style={{ color: 'rgba(245,232,204,0.4)' }}>{pct}%</span>
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

      {done && (
        <div className="feldpost-border text-center py-12 px-8" style={{ background: 'rgba(245,232,204,0.03)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', color: 'var(--color-gold)' }}>Gruppe gemeistert!</div>
          <p className="mt-3 text-sm italic" style={{ color: 'rgba(245,232,204,0.5)' }}>Alle {chunkTotal} Verben 2× richtig.</p>
          <button
            onClick={handleRestart}
            className="mt-6 px-6 py-2 text-sm uppercase tracking-widest"
            style={{ border: '1px solid var(--color-gold)', color: 'var(--color-gold)', background: 'transparent', fontFamily: 'var(--font-mono-custom)', cursor: 'pointer' }}
          >
            Nochmal
          </button>
        </div>
      )}

      {current && (
        <>
          <div
            className="feldpost-border flex flex-col items-center justify-center px-8 py-10 mb-6"
            style={{ background: 'rgba(245,232,204,0.05)', minHeight: 200 }}
          >
            <div className="text-xs uppercase tracking-[0.25em] mb-4" style={{ color: 'rgba(245,232,204,0.35)', fontFamily: 'var(--font-mono-custom)' }}>
              Infinitiv
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: 700, color: 'var(--color-parchment)', letterSpacing: '0.01em' }}>
              {current.infinitiv}
            </div>
            {current.translation && (
              <div className="mt-2 text-sm italic" style={{ color: 'rgba(245,232,204,0.4)', fontFamily: 'var(--font-body)' }}>
                {current.translation}
              </div>
            )}
            <div className="mt-3 flex items-center gap-4 text-xs uppercase tracking-widest" style={{ color: 'rgba(245,232,204,0.2)', fontFamily: 'var(--font-mono-custom)' }}>
              {current.praesens && <span>3.Sg: {current.praesens}</span>}
              <span>Hilfsverb: {current.hilfsverb}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {(['imperfekt', 'partizip2'] as Field[]).map((field) => {
              const correct = result?.[field];
              const borderColor = result === null ? 'rgba(201,149,42,0.3)' : correct ? 'rgba(74,110,26,0.7)' : 'rgba(139,46,10,0.7)';
              const color = result === null ? 'var(--color-parchment)' : correct ? '#4a8c30' : 'var(--color-rust)';
              return (
                <div key={field}>
                  <div className="text-xs uppercase tracking-widest mb-1.5" style={{ color: 'rgba(245,232,204,0.35)', fontFamily: 'var(--font-mono-custom)' }}>
                    {field === 'imperfekt' ? 'Imperfekt' : 'Partizip II'}
                  </div>
                  <input
                    ref={field === 'imperfekt' ? imperfektRef : undefined}
                    type="text"
                    value={answer[field]}
                    onChange={e => setAnswer(a => ({ ...a, [field]: e.target.value }))}
                    onKeyDown={e => {
                      if (e.key === 'Tab' && field === 'imperfekt') {
                        e.preventDefault();
                        (document.querySelector('input[placeholder="z.B. gegangen"]') as HTMLInputElement)?.focus();
                      }
                    }}
                    disabled={!!result}
                    placeholder={field === 'imperfekt' ? 'z.B. ging' : 'z.B. gegangen'}
                    className="w-full px-3 py-2 text-sm bg-transparent outline-none"
                    style={{ border: `1px solid ${borderColor}`, color, fontFamily: 'var(--font-mono-custom)' }}
                  />
                  {result && !correct && (
                    <div className="mt-1 text-xs" style={{ color: '#4a8c30', fontFamily: 'var(--font-mono-custom)' }}>
                      ✓ {current[field]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <button
              onClick={result ? handleNext : handleCheck}
              className="px-8 py-2 text-sm uppercase tracking-widest"
              style={{
                border: `1px solid ${result ? 'rgba(201,149,42,0.4)' : 'rgba(74,110,26,0.4)'}`,
                color: result ? 'var(--color-gold)' : '#6a9e3a',
                background: 'transparent',
                fontFamily: 'var(--font-mono-custom)',
                cursor: 'pointer',
              }}
            >
              {result ? 'Weiter' : 'Prüfen'} <span style={{ opacity: 0.4, fontSize: '0.7rem' }}>Enter</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
