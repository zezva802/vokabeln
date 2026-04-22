'use client';

import { useState, useEffect, useCallback } from 'react';
import { kasusApi, KasusQuestion } from '@/lib/api';

const ARTICLES = ['der', 'die', 'das', 'den', 'dem', 'des'];

export function Kasus() {
  const [question, setQuestion] = useState<KasusQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [stats, setStats] = useState({ correct: 0, total: 0 });

  const loadQuestion = useCallback(async () => {
    setLoading(true);
    setSelected(null);
    try {
      const q = await kasusApi.getQuestion();
      setQuestion(q);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadQuestion(); }, [loadQuestion]);

  const handleSelect = useCallback((article: string) => {
    if (selected || !question) return;
    setSelected(article);
    setStats(s => ({
      correct: s.correct + (article === question.correctArticle ? 1 : 0),
      total: s.total + 1,
    }));
  }, [selected, question]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!question || loading) return;
      if (selected && e.code === 'Space') { e.preventDefault(); loadQuestion(); return; }
      const idx = parseInt(e.key) - 1;
      if (idx >= 0 && idx < ARTICLES.length) handleSelect(ARTICLES[idx]);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [question, loading, selected, handleSelect, loadQuestion]);

  const isCorrect = selected !== null && question !== null && selected === question.correctArticle;


  return (
    <div className="animate-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span
          className="px-2.5 py-1 text-xs uppercase tracking-widest"
          style={{
            fontFamily: 'var(--font-mono-custom)',
            border: '1px solid rgba(122,58,140,0.5)',
            color: '#b06ad0',
            background: 'rgba(122,58,140,0.1)',
          }}
        >
          Kasus-Training
        </span>
        {stats.total > 0 && (
          <span style={{ fontFamily: 'var(--font-mono-custom)', fontSize: '0.75rem', color: 'rgba(245,232,204,0.4)' }}>
            ✓ {stats.correct} / {stats.total}
          </span>
        )}
      </div>

      {loading && (
        <div className="feldpost-border flex flex-col items-center justify-center py-20" style={{ background: 'rgba(245,232,204,0.03)', minHeight: 280 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'rgba(245,232,204,0.3)' }}>
            Generiere…
          </div>
        </div>
      )}

      {!loading && question && (
        <>
          {/* Sentence card */}
          <div
            className="feldpost-border flex flex-col items-center justify-center px-8 py-12 mb-6"
            style={{ background: 'rgba(245,232,204,0.05)', minHeight: 260 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <span
                className="text-xs uppercase tracking-[0.25em]"
                style={{ color: 'rgba(245,232,204,0.35)', fontFamily: 'var(--font-mono-custom)' }}
              >
                Welcher Artikel?
              </span>
              {question.isNewWord && (
                <span
                  className="text-xs px-2 py-0.5"
                  style={{ fontFamily: 'var(--font-mono-custom)', color: '#b06ad0', border: '1px solid rgba(122,58,140,0.4)', background: 'rgba(122,58,140,0.08)' }}
                >
                  neu
                </span>
              )}
            </div>

            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.9rem',
                fontWeight: 700,
                color: selected ? (isCorrect ? '#4a8c30' : 'var(--color-rust)') : 'var(--color-parchment)',
                lineHeight: 1.4,
                textAlign: 'center',
              }}
            >
              {selected ? question.sentenceFull : question.sentenceWithBlank}
            </div>

            {/* Translation hint for new words — always visible */}
            {question.isNewWord && question.translation && (
              <div
                className="mt-3 text-sm italic"
                style={{ color: 'rgba(245,232,204,0.4)', fontFamily: 'var(--font-body)', textAlign: 'center' }}
              >
                {question.noun} = {question.translation}
              </div>
            )}

            {selected && (
              <div className="mt-4 animate-in" style={{ textAlign: 'center' }}>
                <span
                  className="text-xs uppercase tracking-widest px-2 py-0.5"
                  style={{
                    fontFamily: 'var(--font-mono-custom)',
                    color: 'rgba(245,232,204,0.5)',
                    border: '1px solid rgba(245,232,204,0.15)',
                  }}
                >
                  {question.correctCase}
                </span>
                <div
                  className="mt-3 text-sm italic"
                  style={{ color: 'rgba(245,232,204,0.5)', fontFamily: 'var(--font-body)', maxWidth: 380 }}
                >
                  {question.explanation}
                </div>
              </div>
            )}
          </div>

          {/* Article buttons */}
          <div className="grid grid-cols-3 gap-3">
            {ARTICLES.map((art, i) => {
              const isSelected = selected === art;
              const isRight = art === question.correctArticle;
              let borderColor = 'rgba(201,149,42,0.3)';
              let color = 'var(--color-gold)';
              let bg = 'transparent';

              if (selected) {
                if (isRight) { borderColor = 'rgba(74,110,26,0.8)'; color = '#4a8c30'; bg = 'rgba(74,110,26,0.12)'; }
                else if (isSelected) { borderColor = 'rgba(139,46,10,0.8)'; color = 'var(--color-rust)'; bg = 'rgba(139,46,10,0.12)'; }
                else { borderColor = 'rgba(201,149,42,0.1)'; color = 'rgba(245,232,204,0.2)'; }
              }

              return (
                <button
                  key={art}
                  onClick={() => handleSelect(art)}
                  disabled={!!selected}
                  className="py-3 px-2 text-center transition-all"
                  style={{ border: `1px solid ${borderColor}`, background: bg, color, cursor: selected ? 'default' : 'pointer', fontFamily: 'var(--font-mono-custom)' }}
                >
                  <div className="text-sm font-bold">{art}</div>
                  <span className="kbd mt-1">{i + 1}</span>
                </button>
              );
            })}
          </div>

          {selected && (
            <div className="text-center mt-4 animate-in">
              <button
                onClick={loadQuestion}
                className="px-8 py-2 text-sm uppercase tracking-widest"
                style={{
                  border: '1px solid rgba(201,149,42,0.4)',
                  color: 'var(--color-gold)',
                  background: 'transparent',
                  fontFamily: 'var(--font-mono-custom)',
                  cursor: 'pointer',
                }}
              >
                Weiter <span style={{ opacity: 0.4, fontSize: '0.7rem' }}>Space</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
