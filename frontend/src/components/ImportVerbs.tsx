'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { verbApi } from '@/lib/api';

const PLACEHOLDER = `backen – er bäckt – backte – gebacken – haben – გამოცხობა
befehlen – er befiehlt – befahl – befohlen – haben – ბრძანება
beginnen – er beginnt – begann – begonnen – haben – დაწყება`;

export function ImportVerbs() {
  const qc = useQueryClient();
  const [text, setText] = useState('');

  const importMutation = useMutation({
    mutationFn: (lines: string[]) => verbApi.bulkImport(lines),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['verbs'] }),
  });

  const handleImport = () => {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length === 0) return;
    importMutation.mutate(lines);
  };

  const result = importMutation.data;

  return (
    <div>
      <div className="text-xs uppercase tracking-widest mb-4" style={{ color: 'rgba(245,232,204,0.4)', fontFamily: 'var(--font-mono-custom)' }}>
        Format: infinitiv – [präsens –] imperfekt – partizip II – hilfsverb – übersetzung
      </div>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={PLACEHOLDER}
        rows={10}
        className="w-full px-3 py-2 text-sm bg-transparent outline-none resize-none"
        style={{
          border: '1px solid rgba(201,149,42,0.3)',
          color: 'var(--color-parchment)',
          fontFamily: 'var(--font-mono-custom)',
          lineHeight: 1.7,
        }}
      />

      <div className="flex items-center gap-4 mt-3">
        <button
          onClick={handleImport}
          disabled={importMutation.isPending || !text.trim()}
          className="px-6 py-2 text-sm uppercase tracking-widest"
          style={{
            border: '1px solid rgba(201,149,42,0.5)',
            color: 'var(--color-gold)',
            background: 'transparent',
            fontFamily: 'var(--font-mono-custom)',
            cursor: importMutation.isPending || !text.trim() ? 'not-allowed' : 'pointer',
            opacity: importMutation.isPending || !text.trim() ? 0.4 : 1,
          }}
        >
          {importMutation.isPending ? 'Importiere…' : 'Importieren'}
        </button>

        {result && (
          <span style={{ fontFamily: 'var(--font-mono-custom)', fontSize: '0.8rem', color: 'rgba(245,232,204,0.5)' }}>
            +{result.added} neu, {result.skipped} übersprungen
          </span>
        )}
      </div>
    </div>
  );
}
