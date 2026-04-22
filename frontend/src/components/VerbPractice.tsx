'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { verbApi, Verb } from '@/lib/api';
import { ImportVerbs } from './ImportVerbs';

type Field = 'imperfekt' | 'partizip2';

function normalize(s: string) {
  return s.trim().toLowerCase();
}

interface Answer { imperfekt: string; partizip2: string }
interface Result { imperfekt: boolean; partizip2: boolean }

function pickRandom(verbs: Verb[], excludeId: string | null): Verb | null {
  if (verbs.length === 0) return null;
  const pool = verbs.length > 1 ? verbs.filter(v => v.id !== excludeId) : verbs;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function VerbPractice() {
  const qc = useQueryClient();
  const [current, setCurrent] = useState<Verb | null>(null);
  const [answer, setAnswer] = useState<Answer>({ imperfekt: '', partizip2: '' });
  const [result, setResult] = useState<Result | null>(null);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [showImport, setShowImport] = useState(false);
  const imperfektRef = useRef<HTMLInputElement>(null);
  const partizipRef = useRef<HTMLInputElement>(null);

  const { data: verbs = [], isLoading } = useQuery<Verb[]>({
    queryKey: ['verbs'],
    queryFn: verbApi.getAll,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const previousId = useRef<string | null>(null);

  useEffect(() => {
    if (verbs.length > 0 && !current) {
      const v = pickRandom(verbs, null);
      setCurrent(v);
      previousId.current = v?.id ?? null;
    }
  }, [verbs, current]);

  const handleCheck = useCallback(() => {
    if (!current || result) return;
    const r = {
      imperfekt: normalize(answer.imperfekt) === normalize(current.imperfekt),
      partizip2: normalize(answer.partizip2) === normalize(current.partizip2),
    };
    setResult(r);
    setStats(s => ({
      correct: s.correct + (r.imperfekt && r.partizip2 ? 1 : 0),
      total: s.total + 1,
    }));
  }, [current, answer, result]);

  const handleNext = useCallback(() => {
    const next = pickRandom(verbs, previousId.current);
    previousId.current = next?.id ?? null;
    setCurrent(next);
    setAnswer({ imperfekt: '', partizip2: '' });
    setResult(null);
    setTimeout(() => imperfektRef.current?.focus(), 50);
  }, [verbs]);

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

  if (verbs.length === 0) return (
    <div>
      <div className="feldpost-border text-center py-12 px-8 mb-6" style={{ background: 'rgba(245,232,204,0.03)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--color-gold)' }}>Keine Verben</div>
        <p className="mt-3 text-sm italic" style={{ color: 'rgba(245,232,204,0.5)' }}>Importiere zuerst einige Verben.</p>
        <button
          onClick={() => setShowImport(true)}
          className="mt-4 px-6 py-2 text-sm uppercase tracking-widest"
          style={{ border: '1px solid var(--color-gold)', color: 'var(--color-gold)', background: 'transparent', fontFamily: 'var(--font-mono-custom)', cursor: 'pointer' }}
        >
          Importieren
        </button>
      </div>
      {showImport && <ImportVerbs />}
    </div>
  );

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span
          className="px-2.5 py-1 text-xs uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-mono-custom)', border: '1px solid rgba(74,110,26,0.5)', color: '#6a9e3a', background: 'rgba(74,110,26,0.08)' }}
        >
          Verben-Drill
        </span>
        {stats.total > 0 && (
          <span style={{ fontFamily: 'var(--font-mono-custom)', fontSize: '0.75rem', color: 'rgba(245,232,204,0.4)' }}>
            ✓ {stats.correct} / {stats.total}
          </span>
        )}
        <div className="flex-1" />
        <button
          onClick={() => setShowImport(s => !s)}
          className="text-xs uppercase tracking-widest px-2 py-1"
          style={{ fontFamily: 'var(--font-mono-custom)', color: 'rgba(245,232,204,0.3)', border: '1px solid rgba(245,232,204,0.1)', background: 'transparent', cursor: 'pointer' }}
        >
          {showImport ? 'Schließen' : '+ Importieren'}
        </button>
      </div>

      {showImport && <div className="mb-6"><ImportVerbs /></div>}

      {current && (
        <>
          {/* Card */}
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

          {/* Input fields */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {(['imperfekt', 'partizip2'] as Field[]).map((field, i) => {
              const correct = result?.[field];
              const borderColor = result === null
                ? 'rgba(201,149,42,0.3)'
                : correct ? 'rgba(74,110,26,0.7)' : 'rgba(139,46,10,0.7)';
              const color = result === null
                ? 'var(--color-parchment)'
                : correct ? '#4a8c30' : 'var(--color-rust)';

              return (
                <div key={field}>
                  <div className="text-xs uppercase tracking-widest mb-1.5" style={{ color: 'rgba(245,232,204,0.35)', fontFamily: 'var(--font-mono-custom)' }}>
                    {field === 'imperfekt' ? 'Imperfekt' : 'Partizip II'}
                  </div>
                  <input
                    ref={field === 'imperfekt' ? imperfektRef : partizipRef}
                    type="text"
                    value={answer[field]}
                    onChange={e => setAnswer(a => ({ ...a, [field]: e.target.value }))}
                    onKeyDown={e => {
                      if (e.key === 'Tab' && field === 'imperfekt') { e.preventDefault(); partizipRef.current?.focus(); }
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
