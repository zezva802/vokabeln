'use client';

import { useState } from 'react';
import { Practice } from '@/components/Practice';
import { Kasus } from '@/components/Kasus';
import { VerbPractice } from '@/components/VerbPractice';
import { WordList } from '@/components/WordList';
import { ImportWords } from '@/components/ImportWords';

type Tab = 'practice' | 'kasus' | 'verben' | 'words' | 'import';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'practice', label: 'Üben', icon: '⚔' },
  { id: 'kasus', label: 'Kasus', icon: '✎' },
  { id: 'verben', label: 'Verben', icon: '∞' },
  { id: 'words', label: 'Wortschatz', icon: '☰' },
  { id: 'import', label: 'Importieren', icon: '✦' },
];

export default function Home() {
  const [tab, setTab] = useState<Tab>('practice');

  return (
    <main className="min-h-screen relative" style={{ background: '#0d0a02' }}>
      {/* Vignette burn */}
      <div className="vignette" />

      {/* Header */}
      <header className="relative z-10 border-b" style={{ borderColor: 'rgba(201,149,42,0.2)', padding: '2rem 0 0' }}>
        <div className="max-w-2xl mx-auto px-4">
          {/* Top decorative line */}
          <div className="divider-ornament mb-4" style={{ fontSize: '0.6rem' }}>
            ✠ ✠ ✠
          </div>

          {/* Title block */}
          <div className="text-center mb-5">
            <div
              className="text-xs uppercase tracking-[0.4em] mb-2"
              style={{ color: 'rgba(201,149,42,0.5)', fontFamily: 'var(--font-mono-custom)' }}
            >
              Deutsches Lernheft
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                color: 'var(--color-parchment)',
                lineHeight: 1,
                letterSpacing: '0.02em',
              }}
            >
              Vokabeln
            </h1>
            <div
              className="text-xs italic mt-2"
              style={{ color: 'rgba(201,149,42,0.4)', fontFamily: 'var(--font-body)' }}
            >
              Drill-Modus — Gruppe meistern
            </div>

            {/* Classified stamp */}
            <div className="mt-3">
              <span className="stamp-red" style={{ fontSize: '0.65rem' }}>
                Nur für den Dienstgebrauch
              </span>
            </div>
          </div>

          {/* Nav tabs */}
          <nav className="flex">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex-1 py-2.5 text-sm uppercase tracking-widest transition-all"
                style={{
                  fontFamily: 'var(--font-mono-custom)',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: tab === t.id ? '2px solid var(--color-gold)' : '2px solid transparent',
                  color: tab === t.id ? 'var(--color-gold)' : 'rgba(245,232,204,0.3)',
                  cursor: 'pointer',
                  letterSpacing: '0.15em',
                }}
              >
                <span style={{ marginRight: '0.4em', opacity: 0.5 }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        {tab === 'practice' && <Practice />}
        {tab === 'kasus' && <Kasus />}
        {tab === 'verben' && <VerbPractice />}
        {tab === 'words' && <WordList />}
        {tab === 'import' && <ImportWords />}
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center pb-6 mt-4">
        <div className="divider-ornament max-w-2xl mx-auto px-4 mb-4" style={{ fontSize: '0.5rem' }}>
          ✠
        </div>
        <div
          className="text-xs"
          style={{ color: 'rgba(201,149,42,0.15)', fontFamily: 'var(--font-mono-custom)', letterSpacing: '0.1em' }}
        >
          PostgreSQL // NestJS // Next.js
        </div>
      </footer>
    </main>
  );
}
