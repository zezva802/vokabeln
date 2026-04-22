'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { sentenceApi, SentenceQuestion, CheckResult } from '@/lib/api';

export function SentencePractice() {
  const [question, setQuestion] = useState<SentenceQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<CheckResult | null>(null);
  const [stats, setStats] = useState({ correct: 0, close: 0, total: 0 });
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const loadQuestion = useCallback(async () => {
    setLoading(true);
    setAnswer('');
    setResult(null);
    try {
      const q = await sentenceApi.getQuestion();
      setQuestion(q);
      setTimeout(() => inputRef.current?.focus(), 50);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadQuestion(); }, [loadQuestion]);

  const handleCheck = useCallback(async () => {
    if (!question || result || !answer.trim()) return;
    const r = await sentenceApi.check(answer, question.acceptedVariations);
    setResult(r);
    setStats(s => ({
      correct: s.correct + (r.correct ? 1 : 0),
      close: s.close + (r.close ? 1 : 0),
      total: s.total + 1,
    }));
  }, [question, result, answer]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        if (result) loadQuestion();
        else handleCheck();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [result, handleCheck, loadQuestion]);

  const resultColor = result?.correct ? '#4a8c30' : result?.close ? 'var(--color-gold)' : 'var(--color-rust)';
  const resultLabel = result?.correct ? 'Richtig!' : result?.close ? 'Fast richtig' : 'Falsch';

  return (
    <div className="animate-in">
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span
          className="px-2.5 py-1 text-xs uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-mono-custom)', border: '1px solid rgba(42,100,149,0.5)', color: '#4a82c8', background: 'rgba(42,100,149,0.08)' }}
        >
          Sätze-Training
        </span>
        {stats.total > 0 && (
          <span style={{ fontFamily: 'var(--font-mono-custom)', fontSize: '0.75rem', color: 'rgba(245,232,204,0.4)' }}>
            ✓ {stats.correct} ~ {stats.close} ✕ {stats.total - stats.correct - stats.close}
          </span>
        )}
      </div>

      {loading && (
        <div className="feldpost-border flex items-center justify-center py-20" style={{ background: 'rgba(245,232,204,0.03)', minHeight: 280 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'rgba(245,232,204,0.3)' }}>Generiere…</div>
        </div>
      )}

      {!loading && question && (
        <>
          {/* English sentence card */}
          <div
            className="feldpost-border flex flex-col items-center justify-center px-8 py-10 mb-6"
            style={{ background: 'rgba(245,232,204,0.05)', minHeight: 180 }}
          >
            <div className="text-xs uppercase tracking-[0.25em] mb-4" style={{ color: 'rgba(245,232,204,0.35)', fontFamily: 'var(--font-mono-custom)' }}>
              Übersetze ins Deutsche
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-parchment)', textAlign: 'center', lineHeight: 1.4 }}>
              {question.englishSentence}
            </div>
            <div className="mt-3 text-xs" style={{ color: 'rgba(245,232,204,0.3)', fontFamily: 'var(--font-mono-custom)' }}>
              Fokus: <span style={{ color: 'var(--color-gold)' }}>{question.focusWord}</span>
              <span style={{ color: 'rgba(245,232,204,0.2)' }}> = {question.focusTranslation}</span>
            </div>
          </div>

          {/* Input */}
          <div className="mb-4">
            <textarea
              ref={inputRef}
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              disabled={!!result}
              placeholder="Deine Übersetzung…"
              rows={3}
              className="w-full px-3 py-2 text-sm bg-transparent outline-none resize-none"
              style={{
                border: `1px solid ${result ? (result.correct ? 'rgba(74,110,26,0.7)' : result.close ? 'rgba(201,149,42,0.7)' : 'rgba(139,46,10,0.7)') : 'rgba(201,149,42,0.3)'}`,
                color: 'var(--color-parchment)',
                fontFamily: 'var(--font-mono-custom)',
                fontSize: '1rem',
              }}
            />
          </div>

          {/* Result */}
          {result && (
            <div className="mb-4 animate-in">
              <div className="flex items-center gap-2 mb-2">
                <span style={{ fontFamily: 'var(--font-mono-custom)', fontSize: '0.9rem', color: resultColor, fontWeight: 700 }}>
                  {resultLabel}
                </span>
              </div>
              {!result.correct && (
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: '#4a8c30', fontStyle: 'italic' }}>
                  ✓ {result.germanSentence}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={result ? loadQuestion : handleCheck}
              disabled={!result && !answer.trim()}
              className="px-8 py-2 text-sm uppercase tracking-widest"
              style={{
                border: `1px solid ${result ? 'rgba(201,149,42,0.4)' : 'rgba(42,100,149,0.5)'}`,
                color: result ? 'var(--color-gold)' : '#4a82c8',
                background: 'transparent',
                fontFamily: 'var(--font-mono-custom)',
                cursor: !result && !answer.trim() ? 'not-allowed' : 'pointer',
                opacity: !result && !answer.trim() ? 0.4 : 1,
              }}
            >
              {result ? 'Weiter' : 'Prüfen'} <span style={{ opacity: 0.4, fontSize: '0.7rem' }}>Ctrl+Enter</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
