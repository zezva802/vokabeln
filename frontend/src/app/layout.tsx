import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Providers } from '@/lib/providers';

export const metadata: Metadata = {
  title: 'Vokabeln — Deutsches Lernheft',
  description: 'Spaced repetition flashcards for German vocabulary',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
