'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { wordApi } from '@/lib/api';

const PLACEHOLDER = `die Mutter – დედა
das Bild – სურათი
kochen – საჭმლის მომზადება
der Freund – მეგობარი`;

export function ImportWords() {
  const qc = useQueryClient();
  const [text, setText] = useState('');
  const [result, setResult] = useState<{ added: number; skipped: number } | null>(null);

  const importMutation = useMutation({
    mutationFn: (lines: string[]) => wordApi.bulkImport(lines),
    onSuccess: data => {
      setResult(data);
      if (data.added > 0) {
        setText('');
        qc.invalidateQueries({ queryKey: ['words', 'due', 'stats'] });
      }
    },
  });

  const handleImport = () => {
    const lines = text.split('\n').filter(l => l.trim());
    if (!lines.length) return;
    importMutation.mutate(lines);
  };

  return (
    <div>
      <p className="mb-4 text-sm italic" style={{ color: 'rgba(245,232,204,0.45)' }}>
        Füge Zeilen im Format <span style={{ fontFamily: 'var(--font-mono-custom)', color: 'var(--color-gold)' }}>
          die Mutter – Übersetzung
        </span> ein. Artikel (der/die/das) werden automatisch erkannt.
      </p>

      <textarea
        value={text}
        onChange={e => { setText(e.target.value); setResult(null); }}
        placeholder={PLACEHOLDER}
        rows={12}
        className="w-full p-3 text-sm bg-transparent outline-none resize-y"
        style={{
          border: '1px solid rgba(201,149,42,0.3)',
          color: 'var(--color-parchment)',
          fontFamily: 'var(--font-mono-custom)',
          lineHeight: 1.7,
        }}
      />

      <div className="flex items-center gap-3 mt-3">
        <button
          onClick={handleImport}
          disabled={importMutation.isPending || !text.trim()}
          className="px-6 py-2 text-sm uppercase tracking-widest"
          style={{
            border: '1px solid var(--color-gold)',
            color: 'var(--color-gold)',
            background: 'transparent',
            fontFamily: 'var(--font-mono-custom)',
            cursor: 'pointer',
            opacity: (!text.trim() || importMutation.isPending) ? 0.4 : 1,
          }}
        >
          {importMutation.isPending ? 'Importieren…' : 'Importieren ✠'}
        </button>

        {result && (
          <span className="text-sm animate-in" style={{ fontFamily: 'var(--font-mono-custom)', color: result.added > 0 ? '#4a8c30' : 'rgba(245,232,204,0.4)' }}>
            {result.added > 0 ? `+${result.added} hinzugefügt` : 'Nichts Neues'}
            {result.skipped > 0 ? `, ${result.skipped} übersprungen` : ''}
          </span>
        )}
      </div>

      <div className="mt-6 pt-4" style={{ borderTop: '1px solid rgba(201,149,42,0.15)' }}>
        <div className="text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(245,232,204,0.3)' }}>
          Unterstützte Formate
        </div>
        {['die Mutter – დედა  (Strich)', 'kochen - to cook  (Bindestrich)', 'der Tisch\tthe table  (Tab)'].map(ex => (
          <div key={ex} className="text-xs mb-1" style={{ fontFamily: 'var(--font-mono-custom)', color: 'rgba(245,232,204,0.35)' }}>
            {ex}
          </div>
        ))}
      </div>
    </div>
  );
}
